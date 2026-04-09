import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";

export const metadata: Metadata = {
  title: "分类浏览",
  description: "浏览東方點心全部分类，水饺、烧卖、云吞、煎类等",
};

const colorMap: Record<string, string> = {
  popular: "from-red-50 to-red-100/50",
  signature: "from-amber-50 to-amber-100/50",
  dumplings: "from-orange-50 to-orange-100/50",
  wontons: "from-yellow-50 to-yellow-100/50",
  "pan-fried": "from-stone-50 to-stone-100/50",
  specials: "from-emerald-50 to-emerald-100/50",
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  const products = await getProducts();

  // 统计每个分类的产品数
  const categoryCounts: Record<string, number> = {};
  for (const p of products) {
    categoryCounts[p.category.slug] = (categoryCounts[p.category.slug] || 0) + 1;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">分类浏览</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {categories.length} 个分类，{products.length} 款产品
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 ${colorMap[cat.slug] || "from-muted to-muted/50"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {cat.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cat.description}
                </p>
                <p className="mt-3 text-xs font-medium text-primary">
                  {categoryCounts[cat.slug] || 0} 款产品
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
