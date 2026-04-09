import { CheckCircle, Clock, Package, ShoppingBag, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils/format";
import { auth } from "@/lib/auth";

interface SuccessPageProps {
  searchParams: Promise<{ orderNo?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderNo = params.orderNo || "";

  // 获取订单详情
  let order = null;
  let pointsEarned = 0;
  if (orderNo) {
    order = await prisma.order.findUnique({
      where: { orderNo },
      include: { items: true },
    });

    // 查看用户是否获得了积分
    if (order) {
      const session = await auth();
      if (session?.user?.id) {
        const pointsRecord = await prisma.pointsRecord.findFirst({
          where: { orderId: order.id, points: { gt: 0 } },
          orderBy: { createdAt: "desc" },
        });
        if (pointsRecord) {
          pointsEarned = pointsRecord.points;
        }
      }
    }
  }

  return <SuccessContent orderNo={orderNo} order={order} pointsEarned={pointsEarned} />;
}

interface OrderData {
  id: string;
  orderNo: string;
  deliveryType: string;
  totalAmount: number;
  deliveryFee: number;
  subtotal: number;
  status: string;
  estimatedTime: Date | null;
  createdAt: Date;
  items: { id: string; quantity: number; price: number; productSnapshot: unknown }[];
}

function SuccessContent({ orderNo, order, pointsEarned }: { orderNo: string; order: OrderData | null; pointsEarned: number }) {
  const t = useTranslations("orders");
  const tStore = useTranslations("store");

  const itemCount = order?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const estimatedTimeStr = order?.deliveryType === "PICKUP"
    ? tStore("pickupTime")
    : tStore("deliveryTime");

  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center">
      {/* 成功动画 - 绿色勾 */}
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 animate-in zoom-in-50 duration-500">
        <CheckCircle className="h-12 w-12 text-green-500 animate-in zoom-in-75 duration-700 delay-200" />
      </div>

      <h1 className="text-2xl font-bold animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300">
        {t("orderSuccess")}
      </h1>
      <p className="mt-2 text-muted-foreground animate-in fade-in slide-in-from-bottom-3 duration-500 delay-500">
        {t("thankYou")}
      </p>

      {/* 订单信息卡片 */}
      {orderNo && (
        <div className="mt-6 rounded-xl bg-muted p-5 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{t("orderNo")}</p>
              <p className="mt-0.5 font-mono text-base font-semibold">{orderNo}</p>
            </div>
            {order && (
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{formatPrice(order.totalAmount)}</p>
                <p className="text-[11px] text-muted-foreground">
                  {itemCount} {itemCount > 1 ? "items" : "item"}
                </p>
              </div>
            )}
          </div>

          {/* 预计时间 */}
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-background px-3 py-2.5">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">{t("estimatedTime")}</p>
              <p className="text-sm font-medium">{estimatedTimeStr}</p>
            </div>
          </div>
        </div>
      )}

      {/* 积分获得提示 */}
      {pointsEarned > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700">
          <span>🎉</span>
          <span>{t("pointsEarned", { points: pointsEarned })}</span>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="mt-8 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700">
        {order && (
          <Link
            href={`/account/orders/${order.id}`}
            className={buttonVariants({
              size: "lg",
              className: "h-12 rounded-full gap-2",
            })}
          >
            <Package className="h-4 w-4" />
            {t("viewOrder")}
          </Link>
        )}
        <Link
          href="/products"
          className={buttonVariants({
            size: "lg",
            variant: order ? "outline" : "default",
            className: "h-12 rounded-full gap-2",
          })}
        >
          <ShoppingBag className="h-4 w-4" />
          {t("continueShopping")}
        </Link>
      </div>

      {/* 分享提示 */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground animate-in fade-in duration-500 delay-1000">
        <Share2 className="h-3.5 w-3.5" />
        <span>{t("shareHint")}</span>
      </div>
    </div>
  );
}
