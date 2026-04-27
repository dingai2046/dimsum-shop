import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCategoryBySlug, getCategories } from "@/lib/api/categories";
import { ProductCard } from "@/components/shop/product-card";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "分类未找到" };
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      {/* 返回导航 */}
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        全部点心
      </Link>

      {/* 分类信息 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">{category.name}</h1>
        <p className="mt-2 text-muted-foreground">{category.description}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {category.products.length} 款产品
        </p>
      </div>

      {/* 产品网格 */}
      {category.products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
          {category.products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              slug={product.slug}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              image={product.image || "/images/products/xiajiao-2.jpg"}
              category={category.name}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">该分类暂无产品</p>
        </div>
      )}
    </div>
  );
}
