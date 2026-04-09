"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const statusFlow = [
  { value: "PENDING", label: "待支付" },
  { value: "PAID", label: "已支付" },
  { value: "CONFIRMED", label: "商家已确认" },
  { value: "PREPARING", label: "制作中" },
  { value: "READY", label: "待取餐/待配送" },
  { value: "DELIVERING", label: "配送中" },
  { value: "DELIVERED", label: "已送达" },
  { value: "CANCELLED", label: "已取消" },
  { value: "REFUNDED", label: "已退款" },
];

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusUpdate({ orderId, currentStatus }: OrderStatusUpdateProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    // TODO: 调用 API 更新订单状态
    console.log(`更新订单 ${orderId}: 状态=${status}`);
    alert(`订单状态已更新为：${statusFlow.find((s) => s.value === status)?.label}（Mock）`);
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="h-11 flex-1 rounded-xl border border-input bg-background px-3 text-sm focus:border-ring focus:ring-1 focus:ring-ring"
      >
        {statusFlow.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <Button
        onClick={handleUpdate}
        disabled={loading || status === currentStatus}
        className="h-11 px-6"
      >
        {loading ? "更新中..." : "更新状态"}
      </Button>
    </div>
  );
}
