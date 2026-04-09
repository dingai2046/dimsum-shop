"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, Store, Minus, Plus, CreditCard, Loader2, ChevronDown, Tag, X } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
  const t = useTranslations("checkout");

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
      setPayError(error.message || t("paymentFailed"));
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
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("paying")}</>
        ) : (
          <><CreditCard className="mr-2 h-4 w-4" />{t("payNow")}</>
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
  const t = useTranslations("checkout");
  const tStore = useTranslations("store");
  const tCart = useTranslations("cart");
  const tCommon = useTranslations("common");

  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [step, setStep] = useState<"info" | "payment">("info");
  const [error, setError] = useState("");

  // 错误信息 5 秒后自动消失
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  // 已保存地址
  interface SavedAddress {
    id: string;
    name: string;
    phone: string;
    street1: string;
    street2: string | null;
    suburb: string;
    state: string;
    postcode: string;
    isDefault: boolean;
  }
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);

  // 优惠券状态
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponType, setCouponType] = useState<string>("");
  const [couponMsg, setCouponMsg] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCouponCode, setAvailableCouponCode] = useState("");

  const [form, setForm] = useState({
    name: "", phone: "", street1: "", street2: "",
    suburb: "", state: "VIC", postcode: "",
  });

  // 获取用户已保存地址
  useEffect(() => {
    async function fetchAddresses() {
      try {
        const res = await fetch("/api/addresses");
        if (!res.ok) return;
        const data = await res.json();
        if (data.addresses && data.addresses.length > 0) {
          setSavedAddresses(data.addresses);
          // 自动选中默认地址
          const defaultAddr = data.addresses.find((a: SavedAddress) => a.isDefault);
          const target = defaultAddr || data.addresses[0];
          setSelectedAddressId(target.id);
          setForm({
            name: target.name,
            phone: target.phone,
            street1: target.street1,
            street2: target.street2 || "",
            suburb: target.suburb,
            state: target.state,
            postcode: target.postcode,
          });
        }
      } catch {
        // 未登录或网络错误，忽略
      }
    }
    fetchAddresses();

    // 检查用户是否有可用优惠券
    async function fetchAvailableCoupons() {
      try {
        const res = await fetch("/api/coupons/available");
        if (!res.ok) return;
        const data = await res.json();
        if (data.couponCode) {
          setAvailableCouponCode(data.couponCode);
        }
      } catch {
        // 忽略
      }
    }
    fetchAvailableCoupons();
  }, []);

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setAddressDropdownOpen(false);
    if (addressId === "new") {
      setForm({ name: "", phone: "", street1: "", street2: "", suburb: "", state: "VIC", postcode: "" });
    } else {
      const addr = savedAddresses.find((a) => a.id === addressId);
      if (addr) {
        setForm({
          name: addr.name,
          phone: addr.phone,
          street1: addr.street1,
          street2: addr.street2 || "",
          suburb: addr.suburb,
          state: addr.state,
          postcode: addr.postcode,
        });
      }
    }
  };

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // 手动修改时切换到新地址模式
    if (selectedAddressId !== "new") {
      setSelectedAddressId("new");
    }
  };

  const isValid = () => {
    if (!form.name || !form.phone) return false;
    if (deliveryType === "delivery") {
      return !!(form.street1 && form.suburb && form.state && form.postcode);
    }
    return true;
  };

  // 计算实际优惠金额（FREE_DELIVERY 取配送费）
  const actualDiscount = couponApplied
    ? (couponType === "FREE_DELIVERY" ? deliveryFee : couponDiscount)
    : 0;
  const finalTotal = totalPrice - actualDiscount;

  // 验证优惠券
  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponMsg("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal: totalPrice - deliveryFee }),
      });
      const data = await res.json();

      if (data.valid) {
        setCouponApplied(true);
        setCouponDiscount(data.discount);
        setCouponType(data.type);
        const displayDiscount = data.type === "FREE_DELIVERY" ? deliveryFee : data.discount;
        setCouponMsg(t("couponApplied", { amount: formatPrice(displayDiscount) }));
      } else {
        setCouponError(data.error || t("couponInvalid"));
      }
    } catch {
      setCouponError(t("networkError"));
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponType("");
    setCouponMsg("");
    setCouponError("");
    setCouponCode("");
  }

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
          couponCode: couponApplied ? couponCode.trim() : undefined,
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json();
        setError((data.error || t("orderFailed")) + (data.detail ? " " + data.detail : ""));
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
          amount: finalTotal,
          orderNo: order.orderNo,
          items: items.map((i) => ({ name: i.name, quantity: i.quantity })),
        }),
      });

      if (!payRes.ok) {
        // 支付创建失败，保留购物车，让用户可以重试
        setError(t("paymentCreateFailed"));
        setLoading(false);
        return;
      }

      const { clientSecret: secret } = await payRes.json();
      setClientSecret(secret);
      setStep("payment");
      clearCart();
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0 && step === "info") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-muted-foreground">{t("cartEmpty")}</p>
        <Link href="/" className="mt-2 inline-block text-sm font-medium text-primary">{t("goShopping")}</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-32">
      <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        {t("backToMenu")}
      </Link>

      <h1 className="mb-6 text-xl font-bold">
        {step === "info" ? t("title") : t("payment")}
      </h1>

      {error && (
        <div className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-2 duration-200">
          {error}
        </div>
      )}

      {step === "payment" && clientSecret ? (
        /* Step 2: Stripe 支付 */
        <section className="rounded-xl bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("orderNo", { no: orderNo })}</span>
            <span className="text-lg font-bold text-primary">{formatPrice(finalTotal)}</span>
          </div>
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
            <PaymentForm orderNo={orderNo} onSuccess={() => router.push(`/orders/success?orderNo=${orderNo}`)} />
          </Elements>
          <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
            <span>🔒 {t("securePayment")}</span>
            <span>✅ {t("qualityGuarantee")}</span>
            <span>↩️ {t("easyRefund")}</span>
          </div>
        </section>
      ) : (
        /* Step 1: 订单信息 */
        <>
          {/* 配送方式提示 */}
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-3">
            {deliveryType === "delivery" ? (
              <>
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{tStore("delivery")}</span>
                <span className="text-xs text-muted-foreground">
                  {deliveryFee > 0 ? tStore("deliveryFee", { fee: formatPrice(deliveryFee) }) : tStore("freeDelivery")}
                </span>
              </>
            ) : (
              <>
                <Store className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{tStore("pickup")}</span>
                <span className="text-xs text-muted-foreground">{tStore("freeDelivery")}</span>
              </>
            )}
          </div>

          {/* 已保存地址选择器 */}
          {savedAddresses.length > 0 && (
            <section className="mb-4 rounded-xl bg-card p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">{t("savedAddresses")}</h2>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAddressDropdownOpen(!addressDropdownOpen)}
                  className="flex w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2.5 text-sm transition-colors hover:border-ring"
                >
                  <span className={selectedAddressId === "new" ? "text-muted-foreground" : ""}>
                    {selectedAddressId === "new"
                      ? t("newAddress")
                      : (() => {
                          const addr = savedAddresses.find((a) => a.id === selectedAddressId);
                          return addr ? `${addr.name} - ${addr.street1}, ${addr.suburb}` : t("selectAddress");
                        })()
                    }
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${addressDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {addressDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-background shadow-lg">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectAddress(addr.id)}
                        className={`flex w-full flex-col items-start px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50 ${selectedAddressId === addr.id ? "bg-primary/5 text-primary" : ""}`}
                      >
                        <span className="font-medium">
                          {addr.name} · {addr.phone}
                          {addr.isDefault && (
                            <span className="ml-1.5 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              {t("selectAddress").charAt(0) === "选" ? "默认" : "Default"}
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {addr.street1}{addr.street2 ? `, ${addr.street2}` : ""}, {addr.suburb} {addr.state} {addr.postcode}
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleSelectAddress("new")}
                      className={`flex w-full items-center px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-muted/50 ${selectedAddressId === "new" ? "text-primary" : "text-muted-foreground"}`}
                    >
                      + {t("newAddress")}
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 联系信息 */}
          <section className="mb-4 rounded-xl bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">
              {deliveryType === "delivery" ? t("deliveryInfo") : t("pickupInfo")}
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t("name")} *</label>
                  <Input value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder={t("name")} className="h-10 rounded-lg" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t("phone")} *</label>
                  <Input value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="04XX XXX XXX" className="h-10 rounded-lg" />
                </div>
              </div>

              {deliveryType === "delivery" && (
                <>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">{t("street")} *</label>
                    <Input value={form.street1} onChange={(e) => updateForm("street1", e.target.value)} placeholder="123 Smith Street" className="h-10 rounded-lg" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">{t("unit")}</label>
                    <Input value={form.street2} onChange={(e) => updateForm("street2", e.target.value)} placeholder="Unit 5, Level 2" className="h-10 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">{t("suburb")} *</label>
                      <Input value={form.suburb} onChange={(e) => updateForm("suburb", e.target.value)} placeholder="Fitzroy" className="h-10 rounded-lg" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">{t("state")} *</label>
                      <select value={form.state} onChange={(e) => updateForm("state", e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                        {AU_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">{t("postcode")} *</label>
                      <Input value={form.postcode} onChange={(e) => updateForm("postcode", e.target.value)} placeholder="3065" className="h-10 rounded-lg" maxLength={4} />
                    </div>
                  </div>
                </>
              )}

              {deliveryType === "pickup" && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm font-medium">{t("pickupAddress")}</p>
                  <p className="text-xs text-muted-foreground">123 Smith St, Fitzroy VIC 3065</p>
                  <p className="text-xs text-muted-foreground">{t("businessHours", { hours: "10:00 - 21:00" })}</p>
                </div>
              )}
            </div>
          </section>

          {/* 商品列表 */}
          <section className="mb-4 rounded-xl bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">{t("itemList")} ({tCart("itemCount", { count: totalItems })})</h2>
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
            <label className="mb-2 block text-sm font-semibold">{t("orderNote")}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("notePlaceholder")}
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-ring focus:ring-1 focus:ring-ring"
              rows={2}
            />
          </section>

          {/* 优惠券 */}
          <section className="mb-4 rounded-xl bg-card p-4 shadow-sm">
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Tag className="h-4 w-4" />
              {t("couponCode")}
            </label>
            {couponApplied ? (
              <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2.5 dark:bg-green-900/20">
                <span className="text-sm font-medium text-green-700 dark:text-green-400">{couponMsg}</span>
                <button onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                {availableCouponCode && !couponCode && (
                  <button
                    type="button"
                    onClick={() => setCouponCode(availableCouponCode)}
                    className="mb-2 flex items-center gap-1.5 rounded-lg bg-primary/5 px-3 py-2 text-xs text-primary hover:bg-primary/10 transition-colors w-full"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    <span className="font-medium">{t("couponAvailable")}</span>
                    <span className="ml-auto font-mono text-[11px] font-semibold">{availableCouponCode}</span>
                  </button>
                )}
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                    placeholder={t("couponCode")}
                    className="h-10 flex-1 rounded-lg uppercase"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || couponLoading}
                    className="h-10 rounded-lg px-4"
                  >
                    {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("applyCoupon")}
                  </Button>
                </div>
                {couponError && (
                  <p className="mt-2 text-xs text-destructive">{couponError}</p>
                )}
              </>
            )}
          </section>

          {/* 费用汇总 + 下单 */}
          <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background px-4 py-3 md:static md:mt-4 md:rounded-xl md:border md:shadow-sm">
            <div className="mx-auto max-w-lg space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{tCart("subtotal")}</span>
                <span>{formatPrice(totalPrice - deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{tCart("deliveryFee")}</span>
                <span className={deliveryFee === 0 || (couponApplied && couponType === "FREE_DELIVERY") ? "text-green-600" : ""}>
                  {deliveryFee === 0 || (couponApplied && couponType === "FREE_DELIVERY") ? tCommon("free") : formatPrice(deliveryFee)}
                </span>
              </div>
              {couponApplied && actualDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("discount")}</span>
                  <span className="text-green-600">-{formatPrice(actualDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-bold">{tCart("total")}</span>
                <span className="text-lg font-bold text-primary">{formatPrice(finalTotal)}</span>
              </div>
              <Button
                onClick={handleCreateOrder}
                disabled={!isValid() || loading}
                className="w-full h-12 rounded-xl text-base font-bold"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("submitting")}</>
                ) : (
                  t("submitOrder", { price: formatPrice(finalTotal) })
                )}
              </Button>
              <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                <span>🔒 {t("securePayment")}</span>
                <span>✅ {t("qualityGuarantee")}</span>
                <span>↩️ {t("easyRefund")}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
