import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 用户领取活动奖励
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

    // 查找用户的参与记录
    const participation = await prisma.campaignParticipation.findUnique({
      where: {
        campaignId_userId: {
          campaignId: campaign.id,
          userId,
        },
      },
    });

    if (!participation) {
      return NextResponse.json({ error: "你尚未参与此活动" }, { status: 400 });
    }

    if (participation.status === "REWARDED") {
      return NextResponse.json({ error: "奖励已领取" }, { status: 400 });
    }

    if (participation.status !== "PENDING") {
      return NextResponse.json({ error: "当前状态无法领取奖励" }, { status: 400 });
    }

    // 根据活动奖励配置创建优惠券
    const reward = campaign.reward as {
      couponType: string;
      couponValue: number;
      couponMinOrder: number;
      couponDesc: string;
    };

    const code = `REVIEW${userId.slice(-6).toUpperCase()}${Date.now().toString(36).slice(-4).toUpperCase()}`;

    const coupon = await prisma.coupon.create({
      data: {
        code,
        type: reward.couponType as "FIXED" | "PERCENT" | "FREE_DELIVERY",
        value: reward.couponValue,
        minOrder: reward.couponMinOrder,
        totalLimit: 1,
        perUserLimit: 1,
        description: reward.couponDesc,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // 更新参与记录
    await prisma.campaignParticipation.update({
      where: { id: participation.id },
      data: {
        status: "REWARDED",
        couponId: coupon.id,
      },
    });

    return NextResponse.json({ success: true, couponCode: code });
  } catch (error) {
    console.error("领取奖励失败:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
