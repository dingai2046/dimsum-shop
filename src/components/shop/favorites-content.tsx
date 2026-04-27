"use client";

import { useState } from "react";
import { Heart, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils/format";
import { useCart } from "@/lib/cart-context";

interface FavoriteItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  soldCount: number;
  isActive: boolean;
  categoryName: string;
}

export function FavoritesContent({
  initialFavorites,
}: {
  initialFavorites: FavoriteItem[];
}) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const t = useTranslations("favorites");
  const tCommon = useTranslations("common");
  const { addItem } = useCart();

  const handleRemove = async (favoriteId: string) => {
    try {
      const res = await fetch(`/api/favorites/${favoriteId}`, { method: "DELETE" });
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
      }
    } catch {
      // 忽略
    }
  };

  const handleAddToCart = (item: FavoriteItem) => {
    addItem({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      price: item.price,
      image: item.image || "/images/products/xiajiao-2.jpg",
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* 头部 */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/account"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold">{t("title")}</h1>
      </div>

      {/* 空状态 */}
      {favorites.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
          <div className="text-5xl animate-gentle-bounce">❤️</div>
          <p className="mt-4 text-muted-foreground">{t("empty")}</p>
          <Link
            href="/menu"
            className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("goMenu")}
          </Link>
        </div>
      )}

      {/* 收藏列表 */}
      {favorites.length > 0 && (
        <div className="grid gap-3">
          {favorites.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 rounded-xl bg-card p-3 shadow-sm"
            >
              {/* 图片 */}
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={item.image || "/images/products/xiajiao-2.jpg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>

              {/* 信息 */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{item.categoryName}</p>
                  <h3 className="font-medium leading-tight">{item.name}</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">{formatPrice(item.price)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      + {tCommon("total")}
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="rounded-full p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
