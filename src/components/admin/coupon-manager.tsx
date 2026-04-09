"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils/format";

interface Coupon {
  id: string;
  code: string;
  type: "FIXED" | "PERCENT" | "FREE_DELIVERY";
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  totalLimit: number;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
  isNewUserOnly: boolean;
  startDate: string;
  endDate: string | null;
  description: string | null;
}

interface CouponManagerProps {
  coupons: Coupon[];
}

function getStatus(coupon: Coupon, t: (key: string) => string): { label: string; className: string } {
  const now = new Date();
  if (coupon.endDate && new Date(coupon.endDate) < now) {
    return { label: t("couponExpired"), className: "bg-muted text-muted-foreground" };
  }
  if (coupon.totalLimit > 0 && coupon.usedCount >= coupon.totalLimit) {
    return { label: t("couponDepleted"), className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" };
  }
  if (!coupon.isActive) {
    return { label: t("couponExpired"), className: "bg-muted text-muted-foreground" };
  }
  return { label: t("couponActive"), className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
}

function formatCouponValue(coupon: Coupon, t: (key: string) => string): string {
  switch (coupon.type) {
    case "FIXED":
      return formatPrice(coupon.value);
    case "PERCENT":
      return `${coupon.value}%`;
    case "FREE_DELIVERY":
      return t("freeDelivery");
    default:
      return String(coupon.value);
  }
}

function formatTypeLabel(type: string, t: (key: string) => string): string {
  switch (type) {
    case "FIXED": return t("fixed");
    case "PERCENT": return t("percent");
    case "FREE_DELIVERY": return t("freeDelivery");
    default: return type;
  }
}

export function CouponManager({ coupons }: CouponManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      code: formData.get("code") as string,
      type: formData.get("type") as string,
      value: parseInt(formData.get("value") as string) || 0,
      minOrder: parseInt(formData.get("minOrder") as string) || 0,
      maxDiscount: parseInt(formData.get("maxDiscount") as string) || null,
      totalLimit: parseInt(formData.get("totalLimit") as string) || 0,
      perUserLimit: parseInt(formData.get("perUserLimit") as string) || 1,
      isNewUserOnly: formData.get("isNewUserOnly") === "on",
      isActive: formData.get("isActive") !== "off",
      startDate: formData.get("startDate") as string || undefined,
      endDate: formData.get("endDate") as string || null,
      description: formData.get("description") as string || null,
    };

    try {
      const url = editing
        ? `/api/admin/coupons/${editing.id}`
        : "/api/admin/coupons";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setOpen(false);
        setEditing(null);
        router.refresh();
      } else {
        const result = await res.json();
        setError(result.error || tCommon("operationFailed"));
      }
    } catch {
      setError(tCommon("networkError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`确定删除优惠券「${code}」吗？`)) return;

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const result = await res.json();
        alert(result.error || tCommon("deleteFailed"));
      }
    } catch {
      alert(tCommon("networkError"));
    }
  }

  async function handleToggleActive(coupon: Coupon) {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      alert(tCommon("networkError"));
    }
  }

  function formatDateForInput(dateStr: string | null): string {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().slice(0, 16);
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {t("newCoupon")}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("couponCode")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("couponType")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("couponValue")}</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">{t("couponMinOrder")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("couponUsed")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("status")}</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">{t("time")}</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("operation")}</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  {tCommon("noData")}
                </td>
              </tr>
            )}
            {coupons.map((coupon) => {
              const status = getStatus(coupon, t);
              return (
                <tr key={coupon.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold">{coupon.code}</span>
                    {coupon.isNewUserOnly && (
                      <span className="ml-2 inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {t("couponNewUserOnly")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatTypeLabel(coupon.type, t)}</td>
                  <td className="px-4 py-3 font-medium">{formatCouponValue(coupon, t)}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {coupon.minOrder > 0 ? formatPrice(coupon.minOrder) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.usedCount}/{coupon.totalLimit > 0 ? coupon.totalLimit : "∞"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                    <div>{new Date(coupon.startDate).toLocaleDateString()}</div>
                    {coupon.endDate && (
                      <div>~ {new Date(coupon.endDate).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className="inline-flex items-center text-muted-foreground hover:text-foreground"
                        title={coupon.isActive ? "停用" : "启用"}
                      >
                        {coupon.isActive ? (
                          <ToggleRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => { setEditing(coupon); setOpen(true); }}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setError(""); } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t("editCoupon") : t("newCoupon")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("couponCode")}</label>
                <Input
                  name="code"
                  required
                  defaultValue={editing?.code}
                  placeholder="WELCOME10"
                  className="h-11 rounded-xl uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("couponType")}</label>
                <select
                  name="type"
                  required
                  defaultValue={editing?.type || "FIXED"}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="FIXED">{t("fixed")}</option>
                  <option value="PERCENT">{t("percent")}</option>
                  <option value="FREE_DELIVERY">{t("freeDelivery")}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("couponValue")} (分/百分比)</label>
                <Input
                  name="value"
                  type="number"
                  required
                  defaultValue={editing?.value ?? 0}
                  placeholder="500 = $5 或 10 = 10%"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("couponMinOrder")} (分)</label>
                <Input
                  name="minOrder"
                  type="number"
                  defaultValue={editing?.minOrder ?? 0}
                  placeholder="0 = 不限"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("couponMaxDiscount")} (分)</label>
                <Input
                  name="maxDiscount"
                  type="number"
                  defaultValue={editing?.maxDiscount ?? ""}
                  placeholder="仅百分比类型"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("couponLimit")}</label>
                <Input
                  name="totalLimit"
                  type="number"
                  defaultValue={editing?.totalLimit ?? 0}
                  placeholder="0 = 不限"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("couponPerUser")}</label>
                <Input
                  name="perUserLimit"
                  type="number"
                  defaultValue={editing?.perUserLimit ?? 1}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="flex items-end gap-4 pb-1">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isNewUserOnly"
                    defaultChecked={editing?.isNewUserOnly ?? false}
                    className="h-4 w-4 rounded border-input"
                  />
                  {t("couponNewUserOnly")}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">开始时间</label>
                <Input
                  name="startDate"
                  type="datetime-local"
                  defaultValue={formatDateForInput(editing?.startDate || null)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">结束时间</label>
                <Input
                  name="endDate"
                  type="datetime-local"
                  defaultValue={formatDateForInput(editing?.endDate || null)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">描述</label>
              <Input
                name="description"
                defaultValue={editing?.description || ""}
                placeholder="优惠券描述（选填）"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1 h-11">
                {loading ? tCommon("saving") : editing ? t("saveChanges") : t("newCoupon")}
              </Button>
              <DialogClose className="flex-1 h-11 inline-flex items-center justify-center rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors">
                {tCommon("cancel")}
              </DialogClose>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
