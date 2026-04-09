import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 获取搭配推荐产品
// 优先推荐与购物车中不同分类的产品，按销量排序
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exclude = searchParams.get("exclude") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "4", 10), 10);

    const excludeIds = exclude ? exclude.split(",").filter(Boolean) : [];

    // 先获取被排除产品的分类，用于降低同分类推荐权重
    let heavyCategoryIds: string[] = [];
    if (excludeIds.length > 0) {
      const cartProducts = await prisma.product.findMany({
        where: { id: { in: excludeIds } },
        select: { categoryId: true },
      });
      // 统计购物车中各分类出现次数
      const categoryCount: Record<string, number> = {};
      for (const p of cartProducts) {
        categoryCount[p.categoryId] = (categoryCount[p.categoryId] || 0) + 1;
      }
      // 出现次数 >= 1 的分类视为"重度"分类
      heavyCategoryIds = Object.keys(categoryCount);
    }

    // 优先从不同分类中获取推荐
    const crossCategoryProducts = await prisma.product.findMany({
      where: {
        id: { notIn: excludeIds },
        isActive: true,
        stock: { gt: 0 },
        ...(heavyCategoryIds.length > 0
          ? { categoryId: { notIn: heavyCategoryIds } }
          : {}),
      },
      orderBy: { soldCount: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        image: true,
        categoryId: true,
      },
    });

    // 如果跨分类产品不够，补充同分类中的热门产品
    let products = crossCategoryProducts;
    if (products.length < limit) {
      const existingIds = [...excludeIds, ...products.map((p) => p.id)];
      const moreProducts = await prisma.product.findMany({
        where: {
          id: { notIn: existingIds },
          isActive: true,
          stock: { gt: 0 },
        },
        orderBy: { soldCount: "desc" },
        take: limit - products.length,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          originalPrice: true,
          image: true,
          categoryId: true,
        },
      });
      products = [...products, ...moreProducts];
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error("获取推荐产品失败:", error);
    return NextResponse.json({ error: "获取推荐失败" }, { status: 500 });
  }
}
