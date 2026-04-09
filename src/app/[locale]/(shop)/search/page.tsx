import type { Metadata } from "next";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/product-card";

export const metadata: Metadata = {
  title: "搜索",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const products = query
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { category: true },
        orderBy: { sortOrder: "asc" },
        take: 20,
      })
    : [];

  return <SearchContent query={query} products={products} />;
}

function SearchContent({ query, products }: {
  query: string;
  products: Array<{
    id: string;
    slug: string;
    name: string;
    price: number;
    originalPrice: number | null;
    image: string | null;
    category: { name: string };
  }>;
}) {
  const t = useTranslations("search");
  const tProduct = useTranslations("product");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      {/* 搜索框 */}
      <form action="/search" method="GET" className="mb-8">
        <div className="relative mx-auto max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder={t("placeholder")}
            autoFocus
            className="h-12 w-full rounded-full border border-border bg-card pl-12 pr-4 text-base shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </form>

      {/* 搜索结果 */}
      {query ? (
        <>
          <p className="mb-6 text-sm text-muted-foreground">
            {t("resultsCount", { query, count: products.length })}
          </p>
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
                  image={product.image || "/images/products/xiajiao.jpg"}
                  category={product.category.name}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">{t("noResults")}</p>
              <Link href="/products" className="mt-3 inline-block text-sm font-medium text-primary">
                {t("browseAll")}
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">{t("inputHint")}</p>
        </div>
      )}
    </div>
  );
}
