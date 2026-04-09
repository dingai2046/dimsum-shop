"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusUpdate({ orderId, currentStatus }: OrderStatusUpdateProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const t = useTranslations("admin");
  const tStatus = useTranslations("orderStatus");
  const tCommon = useTranslations("common");

  const statusFlow = [
    { value: "PENDING", label: tStatus("PENDING") },
    { value: "PAID", label: tStatus("PAID") },
    { value: "CONFIRMED", label: tStatus("CONFIRMED") },
    { value: "PREPARING", label: tStatus("PREPARING") },
    { value: "READY", label: tStatus("READY") },
    { value: "DELIVERING", label: tStatus("DELIVERING") },
    { value: "DELIVERED", label: tStatus("DELIVERED") },
    { value: "CANCELLED", label: tStatus("CANCELLED") },
    { value: "REFUNDED", label: tStatus("REFUNDED") },
  ];

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
        setMessage(t("statusUpdated"));
        router.refresh();
      } else {
        const data = await res.json();
        setMessage(data.error || t("updateFailed"));
      }
    } catch {
      setMessage(tCommon("networkError"));
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
          {loading ? t("updating") : t("updateStatus")}
        </Button>
      </div>
      {message && (
        <p className={`text-sm ${message === t("statusUpdated") ? "text-green-600" : "text-destructive"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
