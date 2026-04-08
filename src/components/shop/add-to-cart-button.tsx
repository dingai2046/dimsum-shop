"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "./quantity-selector";
import { useCart } from "@/lib/cart-context";

interface AddToCartButtonProps {
  productId: string;
  slug: string;
  productName: string;
  price: number;
  image: string;
  stock: number;
}

export function AddToCartButton({
  productId,
  slug,
  productName,
  price,
  image,
  stock,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function handleAddToCart() {
    addItem(
      { productId, slug, name: productName, price, image },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const inStock = stock > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">数量</span>
        <QuantitySelector
          min={1}
          max={Math.min(stock, 99)}
          onChange={setQuantity}
        />
        <span className="text-xs text-muted-foreground">
          库存 {stock} 件
        </span>
      </div>
      <Button
        className="h-12 w-full rounded-full text-base font-semibold shadow-lg shadow-primary/20"
        disabled={!inStock}
        onClick={handleAddToCart}
      >
        {!inStock ? (
          "暂时缺货"
        ) : added ? (
          <>
            <Check className="mr-2 h-5 w-5" />
            已加入购物车
          </>
        ) : (
          <>
            <ShoppingBag className="mr-2 h-5 w-5" />
            加入购物车
          </>
        )}
      </Button>
    </div>
  );
}
