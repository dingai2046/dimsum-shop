// Mock 积分数据 — 后续替换为 Prisma 查询

export interface PointsRecord {
  id: string;
  userId: string;
  orderId: string | null;
  points: number; // 正=获得，负=使用
  type: "EARN" | "REDEEM" | "ADJUST";
  description: string;
  createdAt: string;
}

const mockRecords: PointsRecord[] = [
  {
    id: "pt-1",
    userId: "user-1",
    orderId: "order-1",
    points: 86,
    type: "EARN",
    description: "订单消费获得积分",
    createdAt: "2026-04-08T10:35:00Z",
  },
  {
    id: "pt-2",
    userId: "user-1",
    orderId: null,
    points: 100,
    type: "ADJUST",
    description: "新用户注册奖励",
    createdAt: "2026-04-08T09:00:00Z",
  },
];

export async function getPointsBalance(userId: string): Promise<number> {
  return mockRecords
    .filter((r) => r.userId === userId)
    .reduce((sum, r) => sum + r.points, 0);
}

export async function getPointsRecords(userId: string): Promise<PointsRecord[]> {
  return mockRecords
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// 积分兑换比率：100 积分 = 1 元
export const POINTS_PER_YUAN = 100;
// 消费积分比率：每消费 1 元获得 1 积分
export const EARN_RATE = 1;
