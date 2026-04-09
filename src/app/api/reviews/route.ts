import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 获取某产品的评价（公开，不需要登录）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "缺少产品ID" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId, isVisible: true },
      include: {
        user: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // 计算平均分
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        content: r.content,
        images: r.images,
        createdAt: r.createdAt.toISOString(),
        user: { name: r.user.name || "匿名用户", avatar: r.user.avatar },
      })),
      averageRating: Math.round(avgRating * 10) / 10,
      count: reviews.length,
    });
  } catch (error) {
    console.error("获取评价失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// 创建评价（需要登录）
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { productId, orderId, rating, content } = await request.json();

    if (!productId || !rating) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "评分范围为1-5" }, { status: 400 });
    }

    // 验证用户确实购买过该产品
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          status: { in: ["DELIVERED", "READY", "PAID", "CONFIRMED", "PREPARING"] },
          ...(orderId ? { id: orderId } : {}),
        },
      },
    });

    if (!orderItem) {
      return NextResponse.json({ error: "您尚未购买过该产品" }, { status: 403 });
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        orderId: orderId || null,
        rating,
        content: content || null,
        images: [],
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("创建评价失败:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
