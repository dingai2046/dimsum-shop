import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 删除收藏
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;

    // 验证收藏属于当前用户
    const existing = await prisma.favorite.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "收藏不存在" }, { status: 404 });
    }

    await prisma.favorite.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除收藏失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
