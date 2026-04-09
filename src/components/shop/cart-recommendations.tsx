"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils/format";

interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  categoryId: string;
}

export function CartRecommendations() {
  const { items, addItem } = useCart();
  const t = useTranslations("cart");
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      setProducts([]);
      return;
    }

    const excludeIds = items.map((item) => item.productId).join(",");
    let cancelled = false;

    async function fetchRecommendations() {
      setLoading(true);
      try {
        const res = await fetch(`/api/recommendations?exclude=${excludeIds}&limit=4`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.products) {
          setProducts(data.products);
        }
      } catch {
        // 静默失败，推荐不是核心功能
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRecommendations();
    return () => { cancelled = true; };
  }, [items]);

  if (items.length === 0 || (products.length === 0 && !loading)) return null;

  return (
    <div className="border-t border-border/50 px-4 py-3">
      <h4 className="mb-2 text-xs font-semibold text-muted-foreground">{t("recommendations")}</h4>
      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-28 shrink-0 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex w-28 shrink-0 flex-col overflow-hidden rounded-lg border border-border/50 bg-background"
            >
              <div className="relative h-16 w-full bg-muted">
                <Image
                  src={product.image || "/images/products/xiajiao.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-1.5">
                <p className="text-[11px] font-medium leading-tight line-clamp-1">{product.name}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary">{formatPrice(product.price)}</span>
                  <button
                    onClick={() =>
                      addItem({
                        productId: product.id,
                        slug: product.slug,
                        name: product.name,
                        price: product.price,
                        image: product.image || "/images/products/xiajiao.jpg",
                      })
                    }
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all active:scale-90"
                    title={t("addMore")}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
