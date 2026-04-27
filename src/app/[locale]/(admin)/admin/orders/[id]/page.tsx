import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getOrderById, getStatusInfo } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils/format";
import { OrderStatusUpdate } from "@/components/admin/order-status-update";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  return <AdminOrderDetailContent order={order} />;
}

function AdminOrderDetailContent({ order }: { order: NonNullable<Awaited<ReturnType<typeof getOrderById>>> }) {
  const t = useTranslations("admin");

  const statusInfo = getStatusInfo(order.status);
  const addr = order.addressSnapshot as { name?: string; phone?: string; street1?: string; street2?: string; suburb?: string; state?: string; postcode?: string; province?: string; city?: string; district?: string; detail?: string };

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToOrders")}
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold">{t("orderDetail")}</h1>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
        {order.deliveryType && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            order.deliveryType === "PICKUP"
              ? "bg-purple-50 text-purple-600"
              : "bg-blue-50 text-blue-600"
          }`}>
            {order.deliveryType === "PICKUP" ? t("deliveryTypePickup") : t("deliveryTypeDelivery")}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 订单信息 */}
        <div className="rounded-xl bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">{t("orderInfo")}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("orderNo")}</span>
              <span className="font-mono">{order.orderNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("orderTime")}</span>
              <span>{new Date(order.createdAt).toLocaleString("zh-CN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("customer")}</span>
              <span>{order.user.name || order.user.email || "—"}</span>
            </div>
            {order.estimatedTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("estimatedTime")}</span>
                <span>{new Date(order.estimatedTime).toLocaleString("zh-CN")}</span>
              </div>
            )}
          </div>
        </div>

        {/* 费用明细 */}
        <div className="rounded-xl bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">{t("priceBreakdown")}</h2>
          <div className="space-y-2 text-sm">
            {order.subtotal != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
            )}
            {order.deliveryFee != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("deliveryFee")}</span>
                <span>{order.deliveryFee === 0 ? "免费" : formatPrice(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-medium">{t("totalAmount")}</span>
              <span className="font-semibold text-primary">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* 收货信息 */}
        <div className="rounded-xl bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">{t("deliveryInfo")}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("recipient")}</span>
              <span>{addr.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("phoneNumber")}</span>
              <span>{addr.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("addressLabel")}</span>
              <span className="text-right max-w-[200px]">
                {addr.street1}
                {addr.street2 ? `, ${addr.street2}` : ""}
                {addr.suburb ? `, ${addr.suburb}` : ""}
                {addr.state ? ` ${addr.state}` : ""}
                {addr.postcode ? ` ${addr.postcode}` : ""}
                {addr.province}{addr.city}{addr.district}{addr.detail}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 订单备注 */}
      {order.note && (
        <div className="mt-6 rounded-xl bg-card p-6 shadow-sm space-y-2">
          <h2 className="text-lg font-semibold">{t("orderNote")}</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.note}</p>
        </div>
      )}

      {/* 订单商品 */}
      <div className="mt-6 rounded-xl bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">{t("orderItems")}</h2>
        <div className="space-y-3">
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
                <div className="flex-1">
                  <p className="text-sm font-medium">{snapshot.name || ""}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(item.price)} x {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 状态更新 */}
      <div className="mt-6 rounded-xl bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">{t("updateStatus")}</h2>
        <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
      </div>
    </div>
  );
}
