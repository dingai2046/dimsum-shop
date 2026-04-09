import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 管理员获取所有评价
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
          product: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count(),
    ]);

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        content: r.content,
        images: r.images,
        isVisible: r.isVisible,
        createdAt: r.createdAt.toISOString(),
        user: { name: r.user.name, email: r.user.email },
        product: { name: r.product.name, image: r.product.image },
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("获取评价列表失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// 管理员切换评价可见性
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { id, isVisible } = await request.json();
    if (!id || typeof isVisible !== "boolean") {
      return NextResponse.json({ error: "参数错误" }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id },
      data: { isVisible },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error("更新评价失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// 管理员删除评价
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "缺少评价ID" }, { status: 400 });
    }

    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除评价失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
