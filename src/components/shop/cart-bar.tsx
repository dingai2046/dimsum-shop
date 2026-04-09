"use client";

import { useRef, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface CartBarProps {
  onCartClick: () => void;
}

export function CartBar({ onCartClick }: CartBarProps) {
  const { totalItems, totalPrice, deliveryFee, deliveryType } = useCart();
  const prevItemsRef = useRef(totalItems);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);

  // badge 弹跳 + 图标摇晃
  useEffect(() => {
    if (totalItems !== prevItemsRef.current && totalItems > 0) {
      // badge 弹跳
      if (badgeRef.current) {
        badgeRef.current.classList.remove("animate-badge-in");
        void badgeRef.current.offsetWidth;
        badgeRef.current.classList.add("animate-badge-in");
      }
      // 购物袋摇晃
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
        {/* 购物车图标 + badge */}
        <button
          ref={iconRef}
          onClick={onCartClick}
          className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary shadow-lg transition-transform duration-200 active:scale-90"
        >
          <ShoppingBag className="h-5 w-5 text-primary-foreground" />
          {totalItems > 0 && (
            <span
              ref={badgeRef}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-badge-in"
            >
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </button>

        {/* 价格信息 */}
        <div className="flex flex-1 flex-col">
          {totalItems > 0 ? (
            <>
              <span className="text-lg font-bold text-primary-foreground tabular-nums transition-all duration-200">
                {formatPrice(totalPrice)}
              </span>
              <span className="text-[11px] text-primary-foreground/60">
                {deliveryType === "delivery"
                  ? deliveryFee > 0
                    ? `配送费 ${formatPrice(deliveryFee)}`
                    : "免配送费 🎉"
                  : "门店自取 · 免配送费"}
              </span>
            </>
          ) : (
            <span className="text-sm text-primary-foreground/50">还没有选购菜品</span>
          )}
        </div>

        {/* 去结算按钮 */}
        <button
          onClick={() => {
            if (totalItems > 0) window.location.href = "/checkout";
          }}
          disabled={totalItems === 0}
          className={cn(
            "shrink-0 rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-200",
            totalItems > 0
              ? "bg-primary text-primary-foreground shadow-lg hover:shadow-xl active:scale-95"
              : "bg-primary-foreground/10 text-primary-foreground/30 cursor-not-allowed"
          )}
        >
          去结算
        </button>
      </div>
    </div>
  );
}
