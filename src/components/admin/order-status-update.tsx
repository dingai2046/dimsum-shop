"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpdate() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setMessage("状态已更新");
        router.refresh();
      } else {
        const data = await res.json();
        setMessage(data.error || "更新失败");
      }
    } catch {
      setMessage("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
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
      {message && (
        <p className={`text-sm ${message === "状态已更新" ? "text-green-600" : "text-destructive"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
