import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface SuccessPageProps {
  searchParams: Promise<{ orderNo?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderNo = params.orderNo || "";

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
        <CheckCircle className="h-10 w-10 text-green-500" />
      </div>

      <h1 className="text-2xl font-bold">下单成功！</h1>
      <p className="mt-2 text-muted-foreground">
        感谢你的订购，我们将尽快为你安排发货
      </p>

      {orderNo && (
        <div className="mt-6 rounded-xl bg-muted p-4">
          <p className="text-sm text-muted-foreground">订单编号</p>
          <p className="mt-1 font-mono text-lg font-semibold">{orderNo}</p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/products"
          className={buttonVariants({
            size: "lg",
            className: "h-12 rounded-full",
          })}
        >
          继续购物
        </Link>
        <Link
          href="/"
          className={buttonVariants({
            size: "lg",
            variant: "outline",
            className: "h-12 rounded-full",
          })}
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
