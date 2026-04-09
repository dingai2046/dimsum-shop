"use client";

import { useRef, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart, FREE_DELIVERY_THRESHOLD, MIN_ORDER_AMOUNT } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface CartBarProps {
  onCartClick: () => void;
}

export function CartBar({ onCartClick }: CartBarProps) {
  const { totalItems, totalPrice, subtotal, deliveryFee, deliveryType } = useCart();
  const t = useTranslations("cart");
  const ts = useTranslations("store");
  const prevItemsRef = useRef(totalItems);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (totalItems !== prevItemsRef.current && totalItems > 0) {
      if (badgeRef.current) {
        badgeRef.current.classList.remove("animate-badge-in");
        void badgeRef.current.offsetWidth;
        badgeRef.current.classList.add("animate-badge-in");
      }
      if (iconRef.current) {
        iconRef.current.classList.remove("animate-cart-bounce");
        void iconRef.current.offsetWidth;
        iconRef.current.classList.add("animate-cart-bounce");
      }
      prevItemsRef.current = totalItems;
    }
  }, [totalItems]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up-bar md:bottom-4 md:left-1/2 md:right-auto md:max-w-lg md:-translate-x-1/2 md:px-4">
      <div className="flex items-center gap-3 bg-foreground px-4 py-3 md:rounded-2xl md:shadow-2xl">
        <button
          ref={iconRef}
          onClick={onCartClick}
          className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary shadow-lg transition-transform duration-200 active:scale-90"
        >
          <ShoppingBag className="h-5 w-5 text-primary-foreground" />
          {totalItems > 0 && (
            <span ref={badgeRef} className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-badge-in">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </button>

        <div className="flex flex-1 flex-col">
          {totalItems > 0 ? (
            <>
              <span className="text-lg font-bold text-primary-foreground tabular-nums transition-all duration-200">
                {formatPrice(totalPrice)}
              </span>
              <span className="text-[11px] text-primary-foreground/60">
                {deliveryType === "delivery"
                  ? deliveryFee > 0
                    ? ts("deliveryFee", { fee: formatPrice(deliveryFee) })
                    : ts("freeDelivery") + " 🎉"
                  : t("freeDeliveryNote")}
              </span>
              {/* 免运费进度条 */}
              {deliveryType === "delivery" && totalItems > 0 && subtotal < FREE_DELIVERY_THRESHOLD && (
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-primary-foreground/20">
                    <div
                      className="h-full rounded-full bg-green-400 transition-all duration-300"
                      style={{ width: `${Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-[10px] text-primary-foreground/60">
                    {t("freeDeliveryProgress", { amount: formatPrice(FREE_DELIVERY_THRESHOLD - subtotal) })}
                  </span>
                </div>
              )}
              {deliveryType === "delivery" && subtotal >= FREE_DELIVERY_THRESHOLD && (
                <span className="mt-0.5 text-[10px] text-green-400">🎉 {t("freeDeliveryReached")}</span>
              )}
            </>
          ) : (
            <span className="text-sm text-primary-foreground/50">{t("noItems")}</span>
          )}
        </div>

        {(() => {
          const belowMinOrder = deliveryType === "delivery" && subtotal < MIN_ORDER_AMOUNT && totalItems > 0;
          return (
            <button
              onClick={() => { if (totalItems > 0 && !belowMinOrder) window.location.href = "/checkout"; }}
              disabled={totalItems === 0 || belowMinOrder}
              className={cn(
                "shrink-0 rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-200",
                totalItems > 0 && !belowMinOrder
                  ? "bg-primary text-primary-foreground shadow-lg hover:shadow-xl active:scale-95"
                  : "bg-primary-foreground/10 text-primary-foreground/30 cursor-not-allowed"
              )}
            >
              {belowMinOrder
                ? t("minOrderWarning", { amount: (MIN_ORDER_AMOUNT / 100).toString() })
                : t("checkout")}
            </button>
          );
        })()}
      </div>
    </div>
  );
}
