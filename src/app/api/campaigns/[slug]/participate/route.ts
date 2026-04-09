import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 用户参与活动
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { slug } = await params;
    const userId = session.user.id as string;

    // 查找活动
    const campaign = await prisma.campaign.findUnique({
      where: { slug },
    });

    if (!campaign) {
      return NextResponse.json({ error: "活动不存在" }, { status: 404 });
    }

    // 检查活动是否有效
    const now = new Date();
    if (!campaign.isActive || campaign.startDate > now) {
      return NextResponse.json({ error: "活动未开始或已关闭" }, { status: 400 });
    }
    if (campaign.endDate && campaign.endDate < now) {
      return NextResponse.json({ error: "活动已结束" }, { status: 400 });
    }

    // 检查是否已参与（@@unique 约束会阻止重复，但提前检查给更好的错误提示）
    const existing = await prisma.campaignParticipation.findUnique({
      where: {
        campaignId_userId: {
          campaignId: campaign.id,
          userId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "你已经参与了这个活动", participation: existing },
        { status: 400 }
      );
    }

    // 创建参与记录
    const participation = await prisma.campaignParticipation.create({
      data: {
        campaignId: campaign.id,
        userId,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, participation });
  } catch (error) {
    console.error("参与活动失败:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
