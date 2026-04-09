import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码至少需要6位" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已注册
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "该邮箱已注册" },
        { status: 409 }
      );
    }

    // 创建用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    // 新用户注册奖励：100积分 + $5优惠券
    let couponCode = "";
    try {
      await prisma.pointsRecord.create({
        data: {
          userId: user.id,
          points: 100,
          type: "ADJUST",
          description: "新用户注册奖励",
        },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { points: 100 },
      });

      couponCode = "WELCOME" + user.id.slice(-6).toUpperCase();
      await prisma.coupon.create({
        data: {
          code: couponCode,
          type: "FIXED",
          value: 500, // $5
          minOrder: 2000, // 满 $20 可用
          totalLimit: 1,
          perUserLimit: 1,
          isNewUserOnly: true,
          description: "新用户首单优惠 $5",
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天有效
        },
      });
    } catch (bonusError) {
      console.error("发放新用户奖励失败:", bonusError);
    }

    return NextResponse.json(
      { message: "注册成功", couponCode },
      { status: 201 }
    );
  } catch (error) {
    console.error("注册失败:", error);
    return NextResponse.json(
      { error: "注册失败，请重试" },
      { status: 500 }
    );
  }
}
