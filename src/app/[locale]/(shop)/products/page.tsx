import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getProducts, type SortOption } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { ProductCard } from "@/components/shop/product-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "全部点心",
  description: "浏览東方點心全部产品，包子、饺子、烧卖、糕点、粥品、茶饮",
};

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const currentCategory = params.category || "";
  const currentSort = (params.sort as SortOption) || "default";

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug: currentCategory || undefined,
      sort: currentSort,
    }),
  ]);

  return <ProductsContent
    categories={categories}
    products={products}
    currentCategory={currentCategory}
    currentSort={currentSort}
  />;
}

function ProductsContent({
  categories,
  products,
  currentCategory,
  currentSort,
}: {
  categories: Awaited<ReturnType<typeof getCategories>>;
  products: Awaited<ReturnType<typeof getProducts>>;
  currentCategory: string;
  currentSort: SortOption;
}) {
  const t = useTranslations("product");

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "default", label: t("sortDefault") },
    { value: "price-asc", label: t("sortPriceAsc") },
    { value: "price-desc", label: t("sortPriceDesc") },
    { value: "newest", label: t("sortNewest") },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">{t("allProducts")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("productsCount", { count: products.length })}
        </p>
      </div>

      {/* 分类筛选 Tab */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Link
          href="/products"
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            !currentCategory
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          {t("allFilter")}
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/products?category=${cat.slug}${currentSort !== "default" ? `&sort=${currentSort}` : ""}`}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              currentCategory === cat.slug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* 排序 */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t("sort")}:</span>
        <div className="flex gap-1.5">
          {sortOptions.map((opt) => (
            <Link
              key={opt.value}
              href={`/products?${currentCategory ? `category=${currentCategory}&` : ""}${opt.value !== "default" ? `sort=${opt.value}` : ""}`}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                currentSort === opt.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* 产品网格 */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              slug={product.slug}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              image={product.image || "/images/products/xiajiao-2.jpg"}
              category={product.category.name}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">{t("noCategoryProducts")}</p>
          <Link
            href="/products"
            className="mt-4 inline-block text-sm font-medium text-primary hover:text-primary/80"
          >
            {t("viewAll")}
          </Link>
        </div>
      )}
    </div>
  );
}
