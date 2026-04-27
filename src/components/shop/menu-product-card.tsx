"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils/format";

interface MenuProductCardProps {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  wholesalePrice?: number | null;
  image: string;
  soldCount?: number;
  tags?: string[];
  servingSize?: string | null;
  onDetailClick?: () => void;
}

export function MenuProductCard({
  id,
  slug,
  name,
  description,
  price,
  originalPrice,
  image,
  soldCount,
  tags,
  servingSize,
  onDetailClick,
}: MenuProductCardProps) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const t = useTranslations("menu");
  const quantity = getItemQuantity(id);
  const prevQuantityRef = useRef(quantity);
  const numRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // 数量变化时触发弹跳动画
  useEffect(() => {
    if (quantity !== prevQuantityRef.current) {
      if (numRef.current && quantity > 0) {
        numRef.current.classList.remove("animate-num-pop");
        void numRef.current.offsetWidth; // force reflow
        numRef.current.classList.add("animate-num-pop");
      }
      if (btnRef.current && quantity > prevQuantityRef.current) {
        btnRef.current.classList.remove("animate-cart-bounce");
        void btnRef.current.offsetWidth;
        btnRef.current.classList.add("animate-cart-bounce");
      }
      prevQuantityRef.current = quantity;
    }
  }, [quantity]);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ productId: id, slug, name, price, image });
  };

  const handleMinus = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(id, quantity - 1);
  };

  const hasDiscount = originalPrice !== null && originalPrice !== undefined && originalPrice > price;

  return (
    <div
      className="flex gap-3 py-3.5 cursor-pointer transition-all duration-150 active:bg-muted/40 active:scale-[0.995]"
      onClick={onDetailClick}
    >
      {/* 产品图片 */}
      <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-xl bg-muted sm:h-[108px] sm:w-[108px] group">
        <Image
          src={image || "/images/products/xiajiao-2.jpg"}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="96px"
        />
        {hasDiscount && (
          <span className="absolute left-0 top-0 rounded-br-lg bg-primary px-1.5 py-0.5 text-[11px] font-bold text-primary-foreground">
            特惠
          </span>
        )}
      </div>

      {/* 产品信息 */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold leading-tight line-clamp-1">{name}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{description}</p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {soldCount && soldCount > 0 && (
              <span className="text-[11px] text-primary font-medium">{t("monthlySales", { count: soldCount })}</span>
            )}
            {servingSize && (
              <span className="text-[11px] text-muted-foreground">{servingSize}</span>
            )}
            {tags?.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-1 py-0.5 text-[11px] text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 价格 + 加购 */}
        <div className="mt-1.5 flex items-end justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-primary/90">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground/60 line-through">
                {formatPrice(originalPrice!)}
              </span>
            )}
          </div>

          {/* 智能加购按钮 — 带动画 */}
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            {quantity > 0 ? (
              <div className="flex items-center gap-1 animate-expand overflow-hidden">
                <button
                  onClick={handleMinus}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-150 hover:bg-muted active:scale-90"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span ref={numRef} className="w-6 text-center text-sm font-bold tabular-nums">
                  {quantity}
                </span>
                <button
                  ref={btnRef}
                  onClick={handleAdd}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all duration-150 active:scale-90"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                ref={btnRef}
                onClick={handleAdd}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:scale-110 active:scale-90"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
