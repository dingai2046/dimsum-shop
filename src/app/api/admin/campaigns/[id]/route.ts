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

    // 如果修改 slug，检查唯一性
    if (data.slug) {
      const existing = await prisma.campaign.findFirst({
        where: { slug: data.slug, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json({ error: "该 Slug 已存在" }, { status: 400 });
      }
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.reward !== undefined && { reward: data.reward }),
        ...(data.config !== undefined && { config: data.config }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
      },
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("更新活动失败:", error);
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

    // 检查是否有参与记录
    const participationCount = await prisma.campaignParticipation.count({
      where: { campaignId: id },
    });

    if (participationCount > 0) {
      return NextResponse.json(
        { error: `该活动已有 ${participationCount} 人参与，无法删除` },
        { status: 400 }
      );
    }

    await prisma.campaign.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除活动失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
