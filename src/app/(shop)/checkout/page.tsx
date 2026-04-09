"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Store, Minus, Plus, CreditCard, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");
const AU_STATES = ["VIC", "NSW", "QLD", "SA", "WA", "TAS", "NT", "ACT"];

// Stripe Payment Form 子组件
function PaymentForm({ orderNo, onSuccess }: { orderNo: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setPayError("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/success?orderNo=${orderNo}`,
      },
    });

    if (error) {
      setPayError(error.message || "支付失败");
      setPaying(false);
    }
    // 如果成功，会自动跳转到 return_url
  }

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement />
      {payError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{payError}</div>
      )}
      <Button type="submit" disabled={!stripe || paying} className="w-full h-12 rounded-xl text-base font-bold">
        {paying ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />支付中...</>
        ) : (
          <><CreditCard className="mr-2 h-4 w-4" />确认支付</>
        )}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items, totalItems, totalPrice, deliveryType, deliveryFee, updateQuantity, clearCart,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [step, setStep] = useState<"info" | "payment">("info");

  const [form, setForm] = useState({
    name: "", phone: "", street1: "", street2: "",
    suburb: "", state: "VIC", postcode: "",
  });

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValid = () => {
    if (!form.name || !form.phone) return false;
    if (deliveryType === "delivery") {
      return !!(form.street1 && form.suburb && form.state && form.postcode);
    }
    return true;
  };

  // Step 1: 创建订单 + 获取 Stripe clientSecret
  async function handleCreateOrder() {
    if (!isValid() || items.length === 0) return;
    setLoading(true);

    try {
      // 创建订单
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          address: form,
          deliveryType,
          deliveryFee,
          note,
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json();
        alert(data.error || "下单失败");
        setLoading(false);
        return;
      }

      const { order } = await orderRes.json();
      setOrderNo(order.orderNo);

      // 创建 Stripe Payment Intent
      const payRes = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          orderNo: order.orderNo,
          items: items.map((i) => ({ name: i.name, quantity: i.quantity })),
        }),
      });

      if (!payRes.ok) {
        // 支付创建失败，但订单已创建，跳转到成功页让用户稍后支付
        clearCart();
        router.push(`/orders/success?orderNo=${order.orderNo}`);
        return;
      }

      const { clientSecret: secret } = await payRes.json();
      setClientSecret(secret);
      setStep("payment");
      clearCart();
    } catch {
      alert("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0 && step === "info") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-muted-foreground">购物车为空</p>
        <Link href="/" className="mt-2 inline-block text-sm font-medium text-primary">去选购</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-32">
      <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        返回菜单
      </Link>

      <h1 className="mb-6 text-xl font-bold">
        {step === "info" ? "确认订单" : "支付"}
      </h1>

      {step === "payment" && clientSecret ? (
        /* Step 2: Stripe 支付 */
        <section className="rounded-xl bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">订单号: {orderNo}</span>
            <span className="text-lg font-bold text-primary">{formatPrice(totalPrice)}</span>
          </div>
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
            <PaymentForm orderNo={orderNo} onSuccess={() => router.push(`/orders/success?orderNo=${orderNo}`)} />
          </Elements>
        </section>
      ) : (
        /* Step 1: 订单信息 */
        <>
          {/* 配送方式提示 */}
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-3">
            {deliveryType === "delivery" ? (
              <>
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">外送配送</span>
                <span className="text-xs text-muted-foreground">
                  {deliveryFee > 0 ? `配送费 ${formatPrice(deliveryFee)}` : "免配送费"}
                </span>
              </>
            ) : (
              <>
                <Store className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">门店自取</span>
                <span className="text-xs text-muted-foreground">免配送费</span>
              </>
            )}
          </div>

          {/* 联系信息 */}
          <section className="mb-4 rounded-xl bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">
              {deliveryType === "delivery" ? "配送信息" : "取餐人信息"}
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">姓名 *</label>
                  <Input value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="收件人姓名" className="h-10 rounded-lg" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">电话 *</label>
                  <Input value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="04XX XXX XXX" className="h-10 rounded-lg" />
                </div>
              </div>

              {deliveryType === "delivery" && (
                <>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">街道地址 *</label>
                    <Input value={form.street1} onChange={(e) => updateForm("street1", e.target.value)} placeholder="123 Smith Street" className="h-10 rounded-lg" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Unit/Apt (可选)</label>
                    <Input value={form.street2} onChange={(e) => updateForm("street2", e.target.value)} placeholder="Unit 5, Level 2" className="h-10 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Suburb *</label>
                      <Input value={form.suburb} onChange={(e) => updateForm("suburb", e.target.value)} placeholder="Fitzroy" className="h-10 rounded-lg" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">State *</label>
                      <select value={form.state} onChange={(e) => updateForm("state", e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                        {AU_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Postcode *</label>
                      <Input value={form.postcode} onChange={(e) => updateForm("postcode", e.target.value)} placeholder="3065" className="h-10 rounded-lg" maxLength={4} />
                    </div>
                  </div>
                </>
              )}

              {deliveryType === "pickup" && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm font-medium">取餐地址</p>
                  <p className="text-xs text-muted-foreground">123 Smith St, Fitzroy VIC 3065</p>
                  <p className="text-xs text-muted-foreground">营业时间：10:00 - 21:00</p>
                </div>
              )}
            </div>
          </section>

          {/* 商品列表 */}
          <section className="mb-4 rounded-xl bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">商品清单 ({totalItems}件)</h2>
            <div className="divide-y divide-border/50">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 py-2.5">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image src={item.image || "/images/products/xiajiao.jpg"} alt={item.name} fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-primary font-medium">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="flex h-6 w-6 items-center justify-center rounded-full border border-border">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 备注 */}
          <section className="mb-4 rounded-xl bg-card p-4 shadow-sm">
            <label className="mb-2 block text-sm font-semibold">订单备注</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="备注口味偏好、过敏信息等（选填）"
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-ring focus:ring-1 focus:ring-ring"
              rows={2}
            />
          </section>

          {/* 费用汇总 + 下单 */}
          <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background px-4 py-3 md:static md:mt-4 md:rounded-xl md:border md:shadow-sm">
            <div className="mx-auto max-w-lg space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">商品小计</span>
                <span>{formatPrice(totalPrice - deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">配送费</span>
                <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                  {deliveryFee === 0 ? "免费" : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-bold">合计</span>
                <span className="text-lg font-bold text-primary">{formatPrice(totalPrice)}</span>
              </div>
              <Button
                onClick={handleCreateOrder}
                disabled={!isValid() || loading}
                className="w-full h-12 rounded-xl text-base font-bold"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />创建订单中...</>
                ) : (
                  `去支付 ${formatPrice(totalPrice)}`
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
