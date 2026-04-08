"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils/format";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 未登录时引导登录
  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=/checkout");
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-xl font-bold">购物车为空</h1>
        <p className="mt-2 text-muted-foreground">请先添加商品再结算</p>
        <Link href="/products">
          <Button className="mt-6 h-12 rounded-full px-8">去选购</Button>
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const address = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      province: formData.get("province") as string,
      city: formData.get("city") as string,
      district: formData.get("district") as string,
      detail: formData.get("detail") as string,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, address }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "下单失败");
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/orders/success?orderNo=${data.order.orderNo}`);
    } catch {
      setError("网络错误，请重试");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <Link
        href="/cart"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回购物车
      </Link>

      <h1 className="mb-8 text-2xl font-bold">确认订单</h1>

      {error && (
        <div className="mb-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 收货地址 */}
        <section className="rounded-2xl bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">收货信息</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">收件人</label>
              <Input
                id="name"
                name="name"
                placeholder="姓名"
                required
                defaultValue={session?.user?.name || ""}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">手机号</label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="11位手机号"
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="province" className="text-sm font-medium">省份</label>
              <Input
                id="province"
                name="province"
                placeholder="省份"
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium">城市</label>
              <Input
                id="city"
                name="city"
                placeholder="城市"
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="district" className="text-sm font-medium">区/县</label>
              <Input
                id="district"
                name="district"
                placeholder="区/县"
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="detail" className="text-sm font-medium">详细地址</label>
              <Input
                id="detail"
                name="detail"
                placeholder="街道、门牌号、楼层"
                required
                className="h-11 rounded-xl"
              />
            </div>
          </div>
        </section>

        {/* 订单商品 */}
        <section className="rounded-2xl bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">订单商品</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                </div>
                <span className="text-sm font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 费用汇总 + 提交 */}
        <section className="rounded-2xl bg-card p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">商品合计</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">运费</span>
              <span className="text-green-600">免运费</span>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-bold">应付总额</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-6 h-12 w-full rounded-full text-base font-semibold shadow-lg shadow-primary/20"
          >
            {loading ? "提交中..." : "提交订单"}
          </Button>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            <span>安全支付，信息加密传输</span>
          </div>
        </section>
      </form>
    </div>
  );
}
