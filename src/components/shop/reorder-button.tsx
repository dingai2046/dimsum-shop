"use client";

import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderItem {
  productId: string;
  quantity: number;
  productSnapshot: {
    name?: string;
    price?: number;
    image?: string;
  };
  price: number;
}

interface ReorderButtonProps {
  items: OrderItem[];
  variant?: "default" | "compact";
  className?: string;
}

export function ReorderButton({ items, variant = "default", className }: ReorderButtonProps) {
  const t = useTranslations("orders");
  const { addItem } = useCart();
  const router = useRouter();

  const handleReorder = (e: React.MouseEvent) => {
    // 阻止冒泡，避免触发外层 Link 跳转
    e.preventDefault();
    e.stopPropagation();

    for (const item of items) {
      const snapshot = item.productSnapshot as { name?: string; price?: number; image?: string };
      addItem(
        {
          productId: item.productId,
          slug: item.productId,
          name: snapshot.name || "",
          price: item.price,
          image: snapshot.image || "",
        },
        item.quantity
      );
    }

    router.push("/");
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleReorder}
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 active:scale-95",
          className
        )}
      >
        <RotateCcw className="h-3 w-3" />
        {t("reorder")}
      </button>
    );
  }

  return (
    <button
      onClick={handleReorder}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:shadow-xl active:scale-95",
        className
      )}
    >
      <RotateCcw className="h-4 w-4" />
      {t("reorder")}
    </button>
  );
}
