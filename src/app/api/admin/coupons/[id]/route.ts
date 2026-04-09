import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: data.code ? data.code.toUpperCase().trim() : undefined,
        type: data.type,
        value: data.value,
        minOrder: data.minOrder,
        maxDiscount: data.maxDiscount ?? null,
        totalLimit: data.totalLimit,
        perUserLimit: data.perUserLimit,
        isActive: data.isActive,
        isNewUserOnly: data.isNewUserOnly,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : null,
        description: data.description ?? null,
      },
    });

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error("更新优惠券失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { id } = await params;

    // 检查是否有使用记录
    const useCount = await prisma.couponUse.count({ where: { couponId: id } });
    if (useCount > 0) {
      // 有使用记录时只标记为不可用，不物理删除
      await prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true, deactivated: true });
    }

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除优惠券失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
