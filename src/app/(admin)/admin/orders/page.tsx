import Link from "next/link";
import { getOrders, getStatusInfo } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const statusFilters = [
  { value: "all", label: "全部" },
  { value: "PENDING", label: "待支付" },
  { value: "PAID", label: "已支付" },
  { value: "PROCESSING", label: "处理中" },
  { value: "SHIPPED", label: "已发货" },
  { value: "DELIVERED", label: "已送达" },
  { value: "CANCELLED", label: "已取消" },
];

interface OrdersPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const currentFilter = params.status || "all";
  let orders = await getOrders();

  if (currentFilter !== "all") {
    orders = orders.filter((o) => o.status === currentFilter);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">订单管理</h1>
        <p className="text-sm text-muted-foreground">{orders.length} 个订单</p>
      </div>

      {/* 状态筛选 */}
      <div className="mb-6 flex gap-1.5 overflow-x-auto pb-2">
        {statusFilters.map((f) => (
          <Link
            key={f.value}
            href={`/admin/orders${f.value !== "all" ? `?status=${f.value}` : ""}`}
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
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">订单号</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">客户</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">金额</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">状态</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">时间</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">操作</th>
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
                        详情
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  没有找到订单
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
