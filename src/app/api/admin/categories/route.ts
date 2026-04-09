import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { name, slug, description, icon, sortOrder } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "名称和 slug 必填" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name, slug, description, icon, sortOrder: sortOrder || 0 },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("创建分类失败:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
