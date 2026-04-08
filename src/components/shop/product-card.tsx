"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format";
import { useCart } from "@/lib/cart-context";

interface ProductCardProps {
  id: string;
  slug?: string;
  name: string;
  price: number; // 分
  originalPrice?: number | null; // 分
  image: string;
  category?: string;
}

export function ProductCard({
  id,
  slug,
  name,
  price,
  originalPrice,
  image,
  category,
}: ProductCardProps) {
  const hasDiscount = originalPrice && originalPrice > price;
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem({ productId: id, slug: slug || id, name, price, image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link
      href={`/products/${slug || id}`}
      className="group block overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      {/* 产品图片 */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {hasDiscount && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground shadow-sm">
            特惠
          </span>
        )}
      </div>

      {/* 产品信息 */}
      <div className="p-3.5 md:p-4">
        {category && (
          <p className="mb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {category}
          </p>
        )}
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 md:text-base">
          {name}
        </h3>
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-primary md:text-xl">
              {formatPrice(price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground/70 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          <Button
            size="icon"
            className={`h-8 w-8 rounded-full transition-colors ${
              added
                ? "bg-green-500 text-white hover:bg-green-500"
                : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
            }`}
            onClick={handleAdd}
          >
            {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Link>
  );
}
