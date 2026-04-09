import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ couponCode: null });
    }

    const now = new Date();

    // 查找用户可用的优惠券（未过期、仍有额度、用户未超限）
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gt: now } }],
      },
      orderBy: { value: "desc" },
      take: 5,
    });

    for (const coupon of coupons) {
      // 检查总使用限制
      if (coupon.totalLimit > 0 && coupon.usedCount >= coupon.totalLimit) {
        continue;
      }

      // 检查每人使用限制
      const userUseCount = await prisma.couponUse.count({
        where: { couponId: coupon.id, userId: session.user.id },
      });
      if (userUseCount >= coupon.perUserLimit) {
        continue;
      }

      // 检查新用户限制
      if (coupon.isNewUserOnly) {
        const orderCount = await prisma.order.count({
          where: { userId: session.user.id },
        });
        if (orderCount > 0) continue;
      }

      return NextResponse.json({ couponCode: coupon.code });
    }

    return NextResponse.json({ couponCode: null });
  } catch (error) {
    console.error("获取可用优惠券失败:", error);
    return NextResponse.json({ couponCode: null });
  }
}
