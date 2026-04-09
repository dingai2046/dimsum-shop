import { Package, ShoppingCart, Users, TrendingUp, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { prisma } from "@/lib/prisma";
import { getOrders } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils/format";

export default async function AdminDashboard() {
  const [productCount, userCount, orders] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
    getOrders(),
  ]);
  const totalRevenue = orders
    .filter((o) => o.status !== "CANCELLED" && o.status !== "REFUNDED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // 热门产品排行（按出现在订单中的次数）
  const productCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  for (const order of orders) {
    for (const item of order.items) {
      const snapshot = item.productSnapshot as { name?: string } | null;
      const itemName = snapshot?.name || "";
      if (!productCounts[item.productId]) {
        productCounts[item.productId] = { name: itemName, count: 0, revenue: 0 };
      }
      productCounts[item.productId].count += item.quantity;
      productCounts[item.productId].revenue += item.price * item.quantity;
    }
  }
  const topProducts = Object.values(productCounts)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // 订单状态分布
  const statusCounts: Record<string, number> = {};
  for (const order of orders) {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
  }

  return <DashboardContent
    productCount={productCount}
    userCount={userCount}
    ordersCount={orders.length}
    totalRevenue={totalRevenue}
    topProducts={topProducts}
    statusCounts={statusCounts}
  />;
}

function DashboardContent({
  productCount,
  userCount,
  ordersCount,
  totalRevenue,
  topProducts,
  statusCounts,
}: {
  productCount: number;
  userCount: number;
  ordersCount: number;
  totalRevenue: number;
  topProducts: { name: string; count: number; revenue: number }[];
  statusCounts: Record<string, number>;
}) {
  const t = useTranslations("admin");
  const tStatus = useTranslations("orderStatus");
  const tCommon = useTranslations("common");

  const stats = [
    { label: t("totalProducts"), value: productCount.toString(), icon: Package, color: "text-blue-600 bg-blue-50" },
    { label: t("totalOrders"), value: ordersCount.toString(), icon: ShoppingCart, color: "text-orange-600 bg-orange-50" },
    { label: t("totalUsers"), value: userCount.toString(), icon: Users, color: "text-green-600 bg-green-50" },
    { label: t("totalRevenue"), value: formatPrice(totalRevenue), icon: TrendingUp, color: "text-primary bg-primary/10" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("dashboard")}</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-card p-5 shadow-sm">
            <div className={`mb-3 inline-flex rounded-lg p-2 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 热门产品 */}
        <div className="rounded-xl bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold">{t("hotProducts")}</h2>
          </div>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    i === 0 ? "bg-amber-100 text-amber-700" :
                    i === 1 ? "bg-gray-100 text-gray-600" :
                    i === 2 ? "bg-orange-100 text-orange-600" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium">{product.name}</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{formatPrice(product.revenue)}</p>
                    <p className="text-[11px] text-muted-foreground">{t("sold", { count: product.count })}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{tCommon("noData")}</p>
          )}
        </div>

        {/* 订单状态分布 */}
        <div className="rounded-xl bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">{t("orderStatus")}</h2>
          </div>
          {Object.keys(statusCounts).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => {
                const total = ordersCount;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{tStatus(status as "PENDING" | "PAID" | "CONFIRMED" | "PREPARING" | "READY" | "DELIVERING" | "DELIVERED" | "CANCELLED" | "REFUNDED")}</span>
                      <span className="font-medium">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{tCommon("noData")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
