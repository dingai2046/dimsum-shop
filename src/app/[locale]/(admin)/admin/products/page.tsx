import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils/format";
const PAGE_SIZE = 20;

async function getProducts(where: object | undefined, page: number) {
  return prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { sortOrder: "asc" },
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });
}

type ProductWithCategory = Awaited<ReturnType<typeof getProducts>>[number];

interface AdminProductsPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const { q, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || "1", 10) || 1);

  const where = q
    ? { name: { contains: q, mode: "insensitive" as const } }
    : undefined;

  const [products, totalCount] = await Promise.all([
    getProducts(where, page),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return <AdminProductsContent
    products={products}
    totalCount={totalCount}
    page={page}
    totalPages={totalPages}
    q={q}
  />;
}

function AdminProductsContent({ products, totalCount, page, totalPages, q }: {
  products: ProductWithCategory[];
  totalCount: number;
  page: number;
  totalPages: number;
  q?: string;
}) {
  const t = useTranslations("admin");

  // 构建分页链接参数
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("products")}</h1>
          <p className="text-sm text-muted-foreground">{t("productsCount", { count: totalCount })}</p>
        </div>
        <Link
          href="/admin/products/new"
          className={buttonVariants({ className: "gap-1.5" })}
        >
          <Plus className="h-4 w-4" />
          {t("newProduct")}
        </Link>
      </div>

      <form className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            type="text"
            defaultValue={q || ""}
            placeholder={t("searchProducts")}
            className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm focus:border-ring focus:ring-1 focus:ring-ring md:max-w-sm"
          />
        </div>
      </form>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("products")}</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">{t("categories")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("amount")}</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">{t("stock")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("status")}</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("operation")}</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={product.image || "/images/products/xiajiao-2.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <span className="font-medium truncate max-w-[120px] md:max-w-none">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {product.category.name}
                  </td>
                  <td className="px-4 py-3 font-medium text-primary">
                    {formatPrice(product.price)}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {product.stock}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      product.isActive
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {product.isActive ? t("active") : t("inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-sm font-medium text-primary hover:text-primary/80"
                    >
                      {t("detail")}
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  {t("noProducts")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("pageInfo", { page, total: totalPages })}
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={buildPageUrl(page - 1)}
                className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1" })}
              >
                <ChevronLeft className="h-4 w-4" />
                {t("prevPage")}
              </Link>
            ) : (
              <span className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1 pointer-events-none opacity-50" })}>
                <ChevronLeft className="h-4 w-4" />
                {t("prevPage")}
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={buildPageUrl(page + 1)}
                className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1" })}
              >
                {t("nextPage")}
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1 pointer-events-none opacity-50" })}>
                {t("nextPage")}
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
