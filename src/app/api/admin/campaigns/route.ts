import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { participations: true },
        },
      },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("获取活动列表失败:", error);
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

    if (!data.title || !data.slug || !data.type) {
      return NextResponse.json({ error: "标题、Slug 和类型必填" }, { status: 400 });
    }

    // 检查 slug 唯一性
    const existing = await prisma.campaign.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return NextResponse.json({ error: "该 Slug 已存在" }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        type: data.type,
        reward: data.reward || {},
        config: data.config || null,
        isActive: data.isActive !== false,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error("创建活动失败:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
