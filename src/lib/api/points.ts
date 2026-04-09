import { prisma } from "@/lib/prisma";

// 积分兑换比率：100 积分 = 1 元
export const POINTS_PER_YUAN = 100;
// 消费积分比率：每消费 1 元获得 1 积分
export const EARN_RATE = 1;

export async function getPointsBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { points: true },
  });
  return user?.points ?? 0;
}

export async function getPointsRecords(userId: string) {
  return prisma.pointsRecord.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
