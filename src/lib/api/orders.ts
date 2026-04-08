import { prisma } from "@/lib/prisma";

// 状态标签映射
const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待支付", color: "bg-yellow-50 text-yellow-600" },
  PAID: { label: "已支付", color: "bg-blue-50 text-blue-600" },
  PROCESSING: { label: "处理中", color: "bg-indigo-50 text-indigo-600" },
  SHIPPED: { label: "已发货", color: "bg-purple-50 text-purple-600" },
  DELIVERED: { label: "已送达", color: "bg-green-50 text-green-600" },
  CANCELLED: { label: "已取消", color: "bg-gray-100 text-gray-500" },
  REFUNDED: { label: "已退款", color: "bg-red-50 text-red-600" },
};

export function getStatusInfo(status: string) {
  return statusLabels[status] || { label: status, color: "bg-gray-100 text-gray-500" };
}

export async function getOrders() {
  return prisma.order.findMany({
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      user: { select: { name: true, email: true } },
    },
  });
}

export async function getOrdersByUserId(userId: string, status?: string) {
  const where: Record<string, unknown> = { userId };
  if (status && status !== "all") {
    where.status = status;
  }

  return prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}
