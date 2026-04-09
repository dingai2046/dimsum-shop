import { prisma } from "@/lib/prisma";

// 状态标签映射（外卖订单流程）
const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待支付", color: "bg-yellow-50 text-yellow-600" },
  PAID: { label: "已支付", color: "bg-blue-50 text-blue-600" },
  CONFIRMED: { label: "商家已确认", color: "bg-indigo-50 text-indigo-600" },
  PREPARING: { label: "制作中", color: "bg-orange-50 text-orange-600" },
  READY: { label: "待取餐", color: "bg-purple-50 text-purple-600" },
  DELIVERING: { label: "配送中", color: "bg-cyan-50 text-cyan-600" },
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
