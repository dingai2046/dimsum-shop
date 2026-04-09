import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("获取优惠券列表失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const data = await request.json();

    if (!data.code || !data.type) {
      return NextResponse.json({ error: "优惠码和类型必填" }, { status: 400 });
    }

    // 检查 code 唯一性
    const existing = await prisma.coupon.findUnique({
      where: { code: data.code.toUpperCase().trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "优惠码已存在" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase().trim(),
        type: data.type,
        value: data.value || 0,
        minOrder: data.minOrder || 0,
        maxDiscount: data.maxDiscount || null,
        totalLimit: data.totalLimit || 0,
        perUserLimit: data.perUserLimit || 1,
        isActive: data.isActive !== false,
        isNewUserOnly: data.isNewUserOnly || false,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        description: data.description || null,
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error("创建优惠券失败:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
