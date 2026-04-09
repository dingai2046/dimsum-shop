import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getStatusInfo } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { Search, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
const PAGE_SIZE = 20;

async function getOrdersPage(where: object, page: number) {
  return prisma.order.findMany({
    where,
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });
}

type OrderWithUser = Awaited<ReturnType<typeof getOrdersPage>>[number];

interface OrdersPageProps {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const currentFilter = params.status || "all";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const q = params.q || "";

  // 构建查询条件
  const where: Record<string, unknown> = {};
  if (currentFilter !== "all") {
    where.status = currentFilter;
  }
  if (q) {
    where.orderNo = { contains: q, mode: "insensitive" };
  }

  const [orders, totalCount] = await Promise.all([
    getOrdersPage(where, page),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <AdminOrdersContent
      orders={orders}
      currentFilter={currentFilter}
      totalCount={totalCount}
      page={page}
      totalPages={totalPages}
      q={q}
    />
  );
}

function AdminOrdersContent({ orders, currentFilter, totalCount, page, totalPages, q }: {
  orders: OrderWithUser[];
  currentFilter: string;
  totalCount: number;
  page: number;
  totalPages: number;
  q: string;
}) {
  const t = useTranslations("admin");
  const tOrders = useTranslations("orders");
  const tStatus = useTranslations("orderStatus");

  const statusFilters = [
    { value: "all", label: tOrders("all") },
    { value: "PENDING", label: tStatus("PENDING") },
    { value: "PAID", label: tStatus("PAID") },
    { value: "CONFIRMED", label: tStatus("CONFIRMED") },
    { value: "PREPARING", label: tStatus("PREPARING") },
    { value: "READY", label: tStatus("READY") },
    { value: "DELIVERING", label: tStatus("DELIVERING") },
    { value: "DELIVERED", label: tStatus("DELIVERED") },
    { value: "CANCELLED", label: tStatus("CANCELLED") },
  ];

  // 构建分页链接参数
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (currentFilter !== "all") params.set("status", currentFilter);
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  };

  // 构建状态筛选链接（重置页码）
  const buildFilterUrl = (status: string) => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (q) params.set("q", q);
    const qs = params.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("orders")}</h1>
          <p className="text-sm text-muted-foreground">{t("ordersCount", { count: totalCount })}</p>
        </div>
        <a
          href="/api/admin/export/orders"
          download
          className={buttonVariants({ variant: "outline", className: "gap-1.5" })}
        >
          <Download className="h-4 w-4" />
          {t("exportCSV")}
        </a>
      </div>

      {/* 搜索 */}
      <form className="mb-4">
        {currentFilter !== "all" && (
          <input type="hidden" name="status" value={currentFilter} />
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            type="text"
            defaultValue={q}
            placeholder={t("searchOrderNo")}
            className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm focus:border-ring focus:ring-1 focus:ring-ring md:max-w-sm"
          />
        </div>
      </form>

      {/* 状态筛选 */}
      <div className="mb-6 flex gap-1.5 overflow-x-auto pb-2">
        {statusFilters.map((f) => (
          <Link
            key={f.value}
            href={buildFilterUrl(f.value)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              currentFilter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("orderNo")}</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">{t("customer")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("amount")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("status")}</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">{t("time")}</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("operation")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs">{order.orderNo}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {order.user.name || order.user.email || "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-primary">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm font-medium text-primary hover:text-primary/80"
                      >
                        {t("detail")}
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  {t("noOrders")}
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
