"use client";

import { useRef, useEffect } from "react";
import { X, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils/format";
import { FavoriteButton } from "@/components/shop/favorite-button";
import { ReviewSummary } from "@/components/shop/product-reviews";

interface ProductDetailSheetProps {
  product: {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    price: number;
    originalPrice?: number | null;
    image: string | null;
    soldCount?: number;
    tags?: string[];
    servingSize?: string | null;
    category: { name: string };
  } | null;
  open: boolean;
  onClose: () => void;
  /** 是否已收藏 */
  isFavorited?: boolean;
  /** 收藏记录 ID */
  favoriteId?: string;
}

export function ProductDetailSheet({ product, open, onClose, isFavorited, favoriteId }: ProductDetailSheetProps) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const sheetRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("product");
  const tMenu = useTranslations("menu");

  // ESC 键关闭
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // 拖拽关闭
  useEffect(() => {
    if (!open || !sheetRef.current) return;
    const sheet = sheetRef.current;
    let startY = 0;
    let currentY = 0;

    const onTouchStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      // Only drag if scrolled to top and dragging down
      const scrollContainer = sheet.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
      if (diff > 0 && (!scrollContainer || scrollContainer.scrollTop <= 0)) {
        sheet.style.transform = `translateY(${diff}px)`;
        sheet.style.transition = "none";
      }
    };
    const onTouchEnd = () => {
      sheet.style.transition = "";
      sheet.style.transform = "";
      if (currentY - startY > 120) onClose();
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

  if (!open || !product) return null;

  const quantity = getItemQuantity(product.id);
  const hasDiscount =
    product.originalPrice !== null &&
    product.originalPrice !== undefined &&
    product.originalPrice > product.price;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image || "/images/products/xiajiao-2.jpg",
    });
  };

  return (
    <>
      {/* 遮罩 */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Product detail"
        className="fixed inset-x-0 bottom-0 z-[61] max-h-[85vh] overflow-hidden rounded-t-3xl bg-background shadow-2xl animate-sheet-up md:inset-x-auto md:left-1/2 md:max-w-lg md:-translate-x-1/2"
      >
        {/* 拖拽手柄 */}
        <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2">
          <div className="h-1 w-10 rounded-full bg-white/50" />
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 active:scale-90"
        >
          <X className="h-4 w-4" />
        </button>

        {/* 产品大图 */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <Image
            src={product.image || "/images/products/xiajiao-2.jpg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 512px"
            loading="eager"
          />
          {/* 底部渐变 */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />
          {hasDiscount && (
            <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg animate-fade-up">
              {t("save", { percent: Math.round((1 - product.price / product.originalPrice!) * 100) })}
            </span>
          )}
        </div>

        {/* 产品信息 */}
        <div className="px-4 pb-6 pt-1">
          <div className="flex items-start justify-between animate-fade-up">
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">{product.category.name}</span>
                <FavoriteButton
                  productId={product.id}
                  initialFavorited={!!isFavorited}
                  favoriteId={favoriteId}
                  className="ml-1"
                />
              </div>
              <h2 className="text-lg font-bold leading-tight">{product.name}</h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary tabular-nums">{formatPrice(product.price)}</p>
              {hasDiscount && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.originalPrice!)}
                </p>
              )}
            </div>
          </div>

          {/* 标签 */}
          <div className="mt-2 flex flex-wrap gap-1.5 animate-fade-up" style={{ animationDelay: "50ms" }}>
            {product.soldCount && product.soldCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                🔥 {tMenu("monthlySales", { count: product.soldCount })}
              </span>
            )}
            {product.servingSize && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                📦 {product.servingSize}
              </span>
            )}
            {product.tags?.map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>

          {/* 描述 */}
          {product.description && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground animate-fade-up" style={{ animationDelay: "100ms" }}>
              {product.description}
            </p>
          )}

          {/* 评价摘要 */}
          <div className="mt-3 animate-fade-up" style={{ animationDelay: "120ms" }}>
            <ReviewSummary productId={product.id} />
          </div>

          {/* 服务保障 */}
          <div className="mt-4 flex gap-3 animate-fade-up" style={{ animationDelay: "150ms" }}>
            {[
              { icon: "🧊", label: t("coldChain") },
              { icon: "👨‍🍳", label: t("handmade") },
              { icon: "✅", label: t("quality") },
            ].map((item) => (
              <span key={item.label} className="rounded-lg border border-accent/30 bg-accent/5 px-2.5 py-1.5 text-xs text-foreground">
                {item.icon} {item.label}
              </span>
            ))}
          </div>

          {/* 加购按钮 */}
          <div className="mt-5 flex items-center gap-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
            {quantity > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-border transition-all active:scale-90"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-xl font-bold tabular-nums">{quantity}</span>
              </div>
            )}
            <button
              onClick={handleAdd}
              className="flex-1 rounded-full bg-primary py-3.5 text-center font-bold text-primary-foreground shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.97]"
            >
              {tMenu("addToCart")} {formatPrice(product.price)}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
