"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils/format";

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  soldCount: number;
}

interface HotPicksProps {
  products: Product[];
}

export function HotPicks({ products }: HotPicksProps) {
  const { addItem, getItemQuantity } = useCart();

  if (products.length === 0) return null;

  return (
    <section className="py-4">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-base font-bold">
          <span className="inline-block animate-pulse">🔥</span>
          必点推荐
        </h2>

        {/* 横向滚动卡片 */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {products.map((product, i) => (
            <HotPickCard
              key={product.id}
              product={product}
              index={i}
              quantity={getItemQuantity(product.id)}
              onAdd={() =>
                addItem({
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  image: product.image || "/images/products/xiajiao.jpg",
                })
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HotPickCard({
  product,
  index,
  quantity,
  onAdd,
}: {
  product: Product;
  index: number;
  quantity: number;
  onAdd: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const prevQtyRef = useRef(quantity);

  useEffect(() => {
    if (quantity > prevQtyRef.current && btnRef.current) {
      btnRef.current.classList.remove("animate-cart-bounce");
      void btnRef.current.offsetWidth;
      btnRef.current.classList.add("animate-cart-bounce");
    }
    prevQtyRef.current = quantity;
  }, [quantity]);

  return (
    <div
      className="w-28 shrink-0 snap-start sm:w-32 animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted group">
        <Image
          src={product.image || "/images/products/xiajiao.jpg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="128px"
        />
        {/* 渐变遮罩 */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
        {/* 加购按钮 */}
        <button
          ref={btnRef}
          onClick={onAdd}
          className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:scale-110 active:scale-90"
        >
          {quantity > 0 ? (
            <span className="text-xs font-bold">{quantity}</span>
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </button>
      </div>
      <p className="mt-1.5 text-xs font-medium line-clamp-1">{product.name}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-bold text-primary">{formatPrice(product.price)}</span>
        <span className="text-[10px] text-muted-foreground">月售{product.soldCount}</span>
      </div>
    </div>
  );
}
