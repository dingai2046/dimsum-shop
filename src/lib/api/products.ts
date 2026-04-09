import { prisma } from "@/lib/prisma";

export type SortOption = "default" | "price-asc" | "price-desc" | "newest";

interface GetProductsOptions {
  categorySlug?: string;
  sort?: SortOption;
  limit?: number;
}

export type ProductWithCategory = Awaited<ReturnType<typeof getProducts>>[number];

export async function getProducts(options: GetProductsOptions = {}) {
  const where: Record<string, unknown> = { isActive: true };

  if (options.categorySlug) {
    where.category = { slug: options.categorySlug };
  }

  let orderBy: Record<string, string> = { sortOrder: "asc" };
  switch (options.sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
  }

  return prisma.product.findMany({
    where,
    include: { category: true },
    orderBy,
    ...(options.limit ? { take: options.limit } : {}),
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export async function getFeaturedProducts(limit = 8) {
  // 按销量排序返回热销产品
  return prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { soldCount: "desc" },
    take: limit,
  });
}

// 获取所有分类及其产品（菜单页用）
export async function getMenuData() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: { category: true },
      },
    },
  });
  return categories;
}

export async function getRelatedProducts(productSlug: string, limit = 4) {
  const current = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: { categoryId: true },
  });
  if (!current) return [];

  return prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: current.categoryId,
      slug: { not: productSlug },
    },
    include: { category: true },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });
}
