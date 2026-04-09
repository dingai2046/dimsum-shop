"use client";

import { Clock, MapPin, Truck } from "lucide-react";
import { useCart } from "@/lib/cart-context";

// 店铺配置（后续可接入后台设置）
const STORE_CONFIG = {
  name: "東方點心 Dong Fang Dim Sim",
  address: "123 Smith St, Fitzroy VIC 3065",
  phone: "(03) 9123 4567",
  openTime: "10:00",
  closeTime: "21:00",
  deliveryRadius: "10km",
  minOrder: 2000, // $20 起送（分）
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
  const open = isOpen();

  return (
    <div className="border-b border-border/50 bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          {/* 营业状态 */}
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${open ? "bg-green-500 animate-pulse" : "bg-red-400"}`}
            />
            <span className="text-xs font-medium">
              {open ? "营业中" : "已打烊"}
            </span>
          </div>

          {/* 分隔 */}
          <span className="text-border">|</span>

          {/* 配送/自取信息 */}
          {deliveryType === "delivery" ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Truck className="h-3.5 w-3.5" />
              <span>{STORE_CONFIG.estimatedDelivery}</span>
              <span className="text-border">·</span>
              <span>满$20起送</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>自取约{STORE_CONFIG.estimatedPickup}</span>
            </div>
          )}
        </div>

        {/* 营业时间 */}
        <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
          <Clock className="h-3.5 w-3.5" />
          <span>{STORE_CONFIG.openTime} - {STORE_CONFIG.closeTime}</span>
        </div>
      </div>
    </div>
  );
}
