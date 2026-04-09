"use client";

import { Truck, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart, type DeliveryType } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

export function DeliveryToggle() {
  const { deliveryType, setDeliveryType } = useCart();
  const t = useTranslations("store");

  const options: { value: DeliveryType; label: string; icon: typeof Truck; desc: string }[] = [
    { value: "delivery", label: t("delivery"), icon: Truck, desc: t("deliveryTime") },
    { value: "pickup", label: t("pickup"), icon: Store, desc: t("pickupTime") },
  ];

  return (
    <div className="relative flex rounded-xl bg-muted/60 p-1">
      <div
        className={cn(
          "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-background shadow-sm transition-all duration-300 ease-out",
          deliveryType === "delivery" ? "left-1" : "left-[calc(50%+3px)]"
        )}
      />
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = deliveryType === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setDeliveryType(opt.value)}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            <Icon className={cn("h-4 w-4 transition-all duration-300", active && "text-primary")} />
            <span>{opt.label}</span>
            <span className={cn("text-[11px] transition-colors duration-200", active ? "text-primary font-medium" : "text-muted-foreground/60")}>
              {opt.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}
