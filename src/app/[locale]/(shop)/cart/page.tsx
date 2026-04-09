"use client";

import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils/format";

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } =
    useCart();
  const t = useTranslations("cart");

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold">{t("empty")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("emptyHint")}
        </p>
        <Link
          href="/products"
          className={buttonVariants({
            size: "lg",
            className: "mt-6 h-12 rounded-full px-8",
          })}
        >
          {t("goShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {t("title")}
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({t("items", { count: totalItems })})
          </span>
        </h1>
        <Button
          variant="ghost"
          className="text-sm text-muted-foreground hover:text-destructive"
          onClick={clearCart}
        >
          {t("clearCart")}
        </Button>
      </div>

      {/* 购物车列表 */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex gap-4 rounded-2xl bg-card p-4 shadow-sm"
          >
            {/* 产品图片 */}
            <Link
              href={`/products/${item.slug}`}
              className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted"
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </Link>

            {/* 产品信息 */}
            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between">
                <Link
                  href={`/products/${item.slug}`}
                  className="font-medium leading-snug hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                {/* 数量控制 */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* 小计 */}
                <span className="text-lg font-bold text-primary">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部结算栏 */}
      <div className="mt-8 rounded-2xl bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted-foreground">{t("itemsTotal")}</span>
          <span className="text-sm">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted-foreground">{t("shipping")}</span>
          <span className="text-sm text-green-600">{t("freeShipping")}</span>
        </div>
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{t("total")}</span>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
        <Link href="/checkout">
          <Button className="mt-6 h-12 w-full rounded-full text-base font-semibold shadow-lg shadow-primary/20">
            {t("checkout")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
