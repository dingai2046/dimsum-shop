import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json({ valid: false, error: "请输入优惠码" });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "优惠码无效" });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: "优惠码已失效" });
    }

    // 检查日期范围
    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      return NextResponse.json({ valid: false, error: "优惠码尚未生效" });
    }
    if (coupon.endDate && now > coupon.endDate) {
      return NextResponse.json({ valid: false, error: "优惠码已过期" });
    }

    // 检查总使用限制
    if (coupon.totalLimit > 0 && coupon.usedCount >= coupon.totalLimit) {
      return NextResponse.json({ valid: false, error: "优惠码已用完" });
    }

    // 检查每人使用限制
    const userUseCount = await prisma.couponUse.count({
      where: { couponId: coupon.id, userId: session.user.id },
    });
    if (userUseCount >= coupon.perUserLimit) {
      return NextResponse.json({ valid: false, error: "你已达到该优惠码的使用次数上限" });
    }

    // 检查最低消费
    if (subtotal < coupon.minOrder) {
      return NextResponse.json({
        valid: false,
        error: `未达到最低消费 $${(coupon.minOrder / 100).toFixed(2)}`,
        errorKey: "couponMinOrder",
        minOrder: coupon.minOrder,
      });
    }

    // 检查是否仅限新用户
    if (coupon.isNewUserOnly) {
      const orderCount = await prisma.order.count({
        where: { userId: session.user.id },
      });
      if (orderCount > 0) {
        return NextResponse.json({ valid: false, error: "该优惠码仅限新用户使用" });
      }
    }

    // 计算折扣金额
    let discount = 0;
    switch (coupon.type) {
      case "FIXED":
        discount = coupon.value;
        break;
      case "PERCENT":
        discount = Math.round(subtotal * coupon.value / 100);
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
        break;
      case "FREE_DELIVERY":
        // 免运费：返回标记，由前端传入配送费
        discount = 0; // 前端根据 type 处理配送费减免
        break;
    }

    return NextResponse.json({
      valid: true,
      discount,
      couponId: coupon.id,
      type: coupon.type,
      description: coupon.description || `优惠码 ${coupon.code}`,
    });
  } catch (error) {
    console.error("验证优惠码失败:", error);
    return NextResponse.json({ valid: false, error: "验证失败" }, { status: 500 });
  }
}
