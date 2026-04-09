"use client";

import { useRef, useEffect } from "react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart, FREE_DELIVERY_THRESHOLD } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils/format";
import { CartRecommendations } from "@/components/shop/cart-recommendations";
import Image from "next/image";

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CartSheet({ open, onClose }: CartSheetProps) {
  const { items, totalItems, totalPrice, subtotal, deliveryFee, deliveryType, updateQuantity, clearCart } = useCart();
  const t = useTranslations("cart");
  const sheetRef = useRef<HTMLDivElement>(null);

  // 拖拽关闭手势
  useEffect(() => {
    if (!open || !sheetRef.current) return;
    const sheet = sheetRef.current;
    let startY = 0;
    let currentY = 0;

    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      if (diff > 0) {
        sheet.style.transform = `translateY(${diff}px)`;
        sheet.style.transition = "none";
      }
    };
    const onTouchEnd = () => {
      const diff = currentY - startY;
      sheet.style.transition = "";
      sheet.style.transform = "";
      if (diff > 100) onClose();
      startY = 0;
      currentY = 0;
    };

    sheet.addEventListener("touchstart", onTouchStart, { passive: true });
    sheet.addEventListener("touchmove", onTouchMove, { passive: true });
    sheet.addEventListener("touchend", onTouchEnd);
    return () => {
      sheet.removeEventListener("touchstart", onTouchStart);
      sheet.removeEventListener("touchmove", onTouchMove);
      sheet.removeEventListener("touchend", onTouchEnd);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* 遮罩 */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed inset-x-0 bottom-0 z-[61] max-h-[70vh] overflow-hidden rounded-t-2xl bg-background shadow-2xl animate-sheet-up md:inset-x-auto md:left-1/2 md:max-w-lg md:-translate-x-1/2"
      >
        {/* 拖拽手柄 */}
        <div className="flex justify-center py-2">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold">{t("title")}</h3>
            <span className="text-sm text-muted-foreground">({t("itemCount", { count: totalItems })})</span>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("clear")}
              </button>
            )}
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-muted transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 商品列表 */}
        <div className="max-h-[45vh] overflow-y-auto px-4 py-2">
          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground animate-fade-up">
              <p className="text-3xl mb-2">🛒</p>
              <p>{t("empty")}</p>
              <p className="mt-1 text-sm">{t("emptyHint")}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {items.map((item, i) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 py-3 animate-fade-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={item.image || "/images/products/xiajiao.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-sm font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-all active:scale-90"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all active:scale-90"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 免运费进度条 */}
        {items.length > 0 && deliveryType === "delivery" && (
          <div className="px-4 py-2">
            {subtotal < FREE_DELIVERY_THRESHOLD ? (
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-300"
                    style={{ width: `${Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {t("freeDeliveryProgress", { amount: formatPrice(FREE_DELIVERY_THRESHOLD - subtotal) })}
                </span>
              </div>
            ) : (
              <p className="text-xs font-medium text-green-600">🎉 {t("freeDeliveryReached")}</p>
            )}
          </div>
        )}

        {/* 搭配推荐 */}
        <CartRecommendations />

        {/* 底部汇总 */}
        {items.length > 0 && (
          <div className="border-t border-border/50 px-4 py-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="tabular-nums">{formatPrice(totalPrice - deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {deliveryType === "delivery" ? t("deliveryFee") : t("selfPickup")}
              </span>
              <span className={deliveryFee === 0 ? "text-green-600 font-medium" : "tabular-nums"}>
                {deliveryFee === 0 ? "免费 🎉" : formatPrice(deliveryFee)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2">
              <span className="font-bold">{t("total")}</span>
              <span className="text-xl font-bold text-primary tabular-nums">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
