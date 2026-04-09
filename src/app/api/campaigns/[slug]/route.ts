import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 公开接口：根据 slug 获取单个活动
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { slug },
    });

    if (!campaign) {
      return NextResponse.json({ error: "活动不存在" }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("获取活动详情失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
