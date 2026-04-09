import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderStatusUpdate } from "@/lib/email";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await request.json();

    const validStatuses = [
      "PENDING", "PAID", "CONFIRMED", "PREPARING",
      "READY", "DELIVERING", "DELIVERED", "CANCELLED", "REFUNDED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "无效状态" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { user: { select: { email: true } } },
    });

    // 发送订单状态更新邮件（不阻塞主流程）
    try {
      if (order.user?.email) {
        sendOrderStatusUpdate(order.user.email, order.orderNo, status);
      }
    } catch (emailError) {
      console.error("发送订单状态更新邮件失败:", emailError);
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("更新订单状态失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
