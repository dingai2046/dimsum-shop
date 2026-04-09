import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 公开接口：获取所有活跃活动
export async function GET() {
  try {
    const now = new Date();

    const campaigns = await prisma.campaign.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("获取活动列表失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
