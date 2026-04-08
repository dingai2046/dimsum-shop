"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const statusFlow = [
  { value: "PENDING", label: "待支付" },
  { value: "PAID", label: "已支付" },
  { value: "PROCESSING", label: "处理中" },
  { value: "SHIPPED", label: "已发货" },
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
  const [trackingNo, setTrackingNo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    // TODO: 调用 API 更新订单状态和物流信息
    console.log(`更新订单 ${orderId}: 状态=${status}, 物流单号=${trackingNo}`);
    alert(`订单状态已更新为：${statusFlow.find((s) => s.value === status)?.label}（Mock）`);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
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
          disabled={loading || (status === currentStatus && !trackingNo)}
          className="h-11 px-6"
        >
          {loading ? "更新中..." : "更新状态"}
        </Button>
      </div>

      {/* 物流追踪 — 发货时需要填写 */}
      {(status === "SHIPPED" || currentStatus === "SHIPPED") && (
        <div className="rounded-xl bg-muted/50 p-4 space-y-3">
          <h3 className="text-sm font-semibold">物流信息</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">物流公司</label>
              <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option>Australia Post</option>
                <option>StarTrack</option>
                <option>Sendle</option>
                <option>DHL</option>
                <option>自配送</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">追踪号</label>
              <Input
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
                placeholder="输入物流追踪号"
                className="h-10 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
