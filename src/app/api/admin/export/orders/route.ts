import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// CSV 值转义：包含逗号、引号或换行的值用双引号包裹
function escapeCsvValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return new Response("Unauthorized", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // 构建日期过滤条件
    const where: Record<string, unknown> = {};
    if (from || to) {
      const createdAt: Record<string, Date> = {};
      if (from) createdAt.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        createdAt.lte = toDate;
      }
      where.createdAt = createdAt;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // 构建 CSV
    const headers = [
      "Order No",
      "Customer",
      "Email",
      "Delivery Type",
      "Subtotal",
      "Delivery Fee",
      "Total",
      "Status",
      "Date",
    ];

    const rows = orders.map((order) => [
      escapeCsvValue(order.orderNo),
      escapeCsvValue(order.user.name || ""),
      escapeCsvValue(order.user.email || ""),
      escapeCsvValue(order.deliveryType),
      (order.subtotal / 100).toFixed(2),
      (order.deliveryFee / 100).toFixed(2),
      (order.totalAmount / 100).toFixed(2),
      escapeCsvValue(order.status),
      new Date(order.createdAt).toISOString().split("T")[0],
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const today = new Date().toISOString().split("T")[0];

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=orders-${today}.csv`,
      },
    });
  } catch (error) {
    console.error("导出订单 CSV 失败:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
