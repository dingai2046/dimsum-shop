import { redirect } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { getOrdersByUserId, getStatusInfo } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { ReorderButton } from "@/components/shop/reorder-button";

interface OrdersPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/orders");

  const params = await searchParams;
  const currentStatus = params.status || "all";
  const orders = await getOrdersByUserId(session.user.id, currentStatus);

  return <OrdersPageContent currentStatus={currentStatus} orders={orders} />;
}

function OrdersPageContent({ currentStatus, orders }: { currentStatus: string; orders: Awaited<ReturnType<typeof getOrdersByUserId>> }) {
  const t = useTranslations("orders");
  const tAccount = useTranslations("account");
  const tCart = useTranslations("cart");

  const statusTabs = [
    { value: "all", label: t("all") },
    { value: "PENDING", label: t("pending") },
    { value: "PREPARING", label: t("preparing") },
    { value: "DELIVERING", label: t("delivering") },
    { value: "DELIVERED", label: t("completed") },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/account"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {tAccount("title")}
      </Link>

      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      {/* 状态 Tab */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {statusTabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/account/orders${tab.value !== "all" ? `?status=${tab.value}` : ""}`}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              currentStatus === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* 订单列表 */}
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block rounded-2xl bg-card p-4 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">
                    {order.orderNo}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="space-y-2">
                  {order.items.map((item) => {
                    const snapshot = item.productSnapshot as { name?: string; image?: string };
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={snapshot.image || "/images/products/xiajiao-2.jpg"}
                            alt={snapshot.name || ""}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{snapshot.name || ""}</p>
                          <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                        </div>
                        <span className="text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                  <div className="flex items-center gap-3">
                    <ReorderButton
                      variant="compact"
                      items={order.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        productSnapshot: item.productSnapshot as { name?: string; price?: number; image?: string },
                      }))}
                    />
                    <span className="text-sm">
                      {tCart("total")} <span className="font-bold text-primary">{formatPrice(order.totalAmount)}</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center animate-fade-up">
          <div className="text-5xl mb-3 animate-gentle-bounce">🍜</div>
          <p className="text-muted-foreground">{t("noOrders")}</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("goShopping")}
          </Link>
        </div>
      )}
    </div>
  );
}
