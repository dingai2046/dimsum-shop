import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, Circle } from "lucide-react";
import { auth } from "@/lib/auth";
import { getOrderById, getStatusInfo } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils/format";

const statusTimeline = [
  { status: "PENDING", label: "下单" },
  { status: "PAID", label: "支付" },
  { status: "CONFIRMED", label: "确认" },
  { status: "PREPARING", label: "制作" },
  { status: "READY", label: "出餐" },
  { status: "DELIVERING", label: "配送" },
  { status: "DELIVERED", label: "送达" },
];

const statusOrder: Record<string, number> = {
  PENDING: 0,
  PAID: 1,
  CONFIRMED: 2,
  PREPARING: 3,
  READY: 4,
  DELIVERING: 5,
  DELIVERED: 6,
};

interface OrderDetailProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailProps) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/orders");

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order || order.userId !== session.user.id) notFound();

  const statusInfo = getStatusInfo(order.status);
  const currentStep = statusOrder[order.status] ?? -1;
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
  const addr = order.addressSnapshot as { name?: string; phone?: string; street1?: string; street2?: string; suburb?: string; state?: string; postcode?: string; province?: string; city?: string; district?: string; detail?: string };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/account/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        我的订单
      </Link>

      {/* 状态头部 */}
      <div className="mb-6 rounded-2xl bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <span className="font-mono text-xs text-muted-foreground">{order.orderNo}</span>
        </div>

        {/* 状态时间线 */}
        {!isCancelled && (
          <div className="mt-6 flex items-center justify-between">
            {statusTimeline.map((step, i) => {
              const isCompleted = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step.status} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "border-2 border-border text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Circle className="h-3 w-3" />
                      )}
                    </div>
                    <span
                      className={`mt-1.5 text-[10px] ${
                        isCurrent ? "font-semibold text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < statusTimeline.length - 1 && (
                    <div
                      className={`mx-1 h-0.5 flex-1 ${
                        i < currentStep ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 商品列表 */}
      <div className="mb-4 rounded-2xl bg-card p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">商品信息</h2>
        <div className="space-y-3">
          {order.items.map((item) => {
            const snapshot = item.productSnapshot as { name?: string; image?: string };
            return (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image src={snapshot.image || "/images/products/xiajiao.jpg"} alt={snapshot.name || "产品"} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{snapshot.name || "产品"}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(item.price)} x {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            );
          })}
          <div className="border-t border-border pt-3 text-right">
            <span className="text-sm text-muted-foreground">合计：</span>
            <span className="ml-2 text-lg font-bold text-primary">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* 收货信息 */}
      <div className="rounded-2xl bg-card p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">收货信息</h2>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <p><span className="text-foreground font-medium">{addr.name}</span> {addr.phone}</p>
          <p>
            {addr.street1}
            {addr.street2 ? `, ${addr.street2}` : ""}
            {addr.suburb ? `, ${addr.suburb}` : ""}
            {addr.state ? ` ${addr.state}` : ""}
            {addr.postcode ? ` ${addr.postcode}` : ""}
            {/* 兼容旧格式 */}
            {addr.province}{addr.city}{addr.district}{addr.detail}
          </p>
        </div>
      </div>
    </div>
  );
}
