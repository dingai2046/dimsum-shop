"use client";

import { Clock, MapPin, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart-context";

const STORE_CONFIG = {
  openTime: "10:00",
  closeTime: "21:00",
  estimatedDelivery: "30-45 min",
  estimatedPickup: "15-20 min",
};

function isOpen(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const current = hours * 60 + minutes;
  const [openH, openM] = STORE_CONFIG.openTime.split(":").map(Number);
  const [closeH, closeM] = STORE_CONFIG.closeTime.split(":").map(Number);
  return current >= openH * 60 + openM && current <= closeH * 60 + closeM;
}

export function StoreStatusBar() {
  const { deliveryType } = useCart();
  const t = useTranslations("store");
  const open = isOpen();

  return (
    <div className="border-b border-border/50 bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${open ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
            <span className="text-xs font-medium">{open ? t("open") : t("closed")}</span>
          </div>
          <span className="text-border">|</span>
          {deliveryType === "delivery" ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Truck className="h-3.5 w-3.5" />
              <span>{STORE_CONFIG.estimatedDelivery}</span>
              <span className="text-border">·</span>
              <span>{t("minOrder")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{t("pickupNote", { time: STORE_CONFIG.estimatedPickup })}</span>
            </div>
          )}
        </div>
        <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
          <Clock className="h-3.5 w-3.5" />
          <span>{t("hours", { open: STORE_CONFIG.openTime, close: STORE_CONFIG.closeTime })}</span>
        </div>
      </div>
    </div>
  );
}
