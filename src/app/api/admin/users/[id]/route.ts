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
    const { role, buyerType, pointsAdjust } = await request.json();

    // 构建更新数据
    const updateData: Record<string, unknown> = {};
    if (role && (role === "CUSTOMER" || role === "ADMIN")) {
      updateData.role = role;
    }
    if (buyerType && (buyerType === "RETAIL" || buyerType === "WHOLESALE")) {
      updateData.buyerType = buyerType;
    }

    // 积分调整
    if (pointsAdjust && typeof pointsAdjust === "number" && pointsAdjust !== 0) {
      // 先获取当前用户积分
      const currentUser = await prisma.user.findUnique({
        where: { id },
        select: { points: true },
      });
      if (!currentUser) {
        return NextResponse.json({ error: "用户不存在" }, { status: 404 });
      }

      const newPoints = currentUser.points + pointsAdjust;
      if (newPoints < 0) {
        return NextResponse.json({ error: "积分不能为负数" }, { status: 400 });
      }
      updateData.points = newPoints;

      // 创建积分记录
      await prisma.pointsRecord.create({
        data: {
          userId: id,
          points: pointsAdjust,
          type: "ADJUST",
          description: `管理员手动调整 ${pointsAdjust > 0 ? "+" : ""}${pointsAdjust}`,
        },
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        buyerType: true,
        points: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("更新用户失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
