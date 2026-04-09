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

interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  reward: {
    couponType: string;
    couponValue: number;
    couponMinOrder: number;
    couponDesc: string;
  };
  config: Record<string, unknown> | null;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  _count: {
    participations: number;
  };
}

interface CampaignManagerProps {
  campaigns: Campaign[];
}

function getStatus(campaign: Campaign, t: (key: string) => string): { label: string; className: string } {
  const now = new Date();
  if (campaign.endDate && new Date(campaign.endDate) < now) {
    return { label: t("campaignEnded"), className: "bg-muted text-muted-foreground" };
  }
  if (!campaign.isActive) {
    return { label: t("inactive"), className: "bg-muted text-muted-foreground" };
  }
  return { label: t("active"), className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
}

function formatTypeLabel(type: string, t: (key: string) => string): string {
  switch (type) {
    case "google_review": return t("googleReviewType");
    default: return type;
  }
}

function formatRewardSummary(reward: Campaign["reward"]): string {
  if (!reward) return "-";
  const value = reward.couponType === "PERCENT"
    ? `${reward.couponValue}%`
    : formatPrice(reward.couponValue);
  return `${value} (满${formatPrice(reward.couponMinOrder)})`;
}

export function CampaignManager({ campaigns }: CampaignManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const reward = {
      couponType: formData.get("couponType") as string,
      couponValue: parseInt(formData.get("couponValue") as string) || 0,
      couponMinOrder: parseInt(formData.get("couponMinOrder") as string) || 0,
      couponDesc: formData.get("couponDesc") as string || "",
    };

    const configReviewUrl = formData.get("reviewUrl") as string;
    const config = configReviewUrl ? { reviewUrl: configReviewUrl } : null;

    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string || null,
      type: formData.get("type") as string,
      reward,
      config,
      isActive: formData.get("isActive") !== "off",
      startDate: formData.get("startDate") as string || undefined,
      endDate: formData.get("endDate") as string || null,
    };

    try {
      const url = editing
        ? `/api/admin/campaigns/${editing.id}`
        : "/api/admin/campaigns";
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

  async function handleDelete(id: string, title: string) {
    if (!confirm(`确定删除活动「${title}」吗？`)) return;

    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, { method: "DELETE" });
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

  async function handleToggleActive(campaign: Campaign) {
    try {
      const res = await fetch(`/api/admin/campaigns/${campaign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !campaign.isActive }),
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
          {t("newCampaign")}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("campaignTitle")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("campaignType")}</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">{t("campaignReward")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("participants")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("status")}</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">{t("time")}</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("operation")}</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  {tCommon("noData")}
                </td>
              </tr>
            )}
            {campaigns.map((campaign) => {
              const status = getStatus(campaign, t);
              return (
                <tr key={campaign.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{campaign.title}</div>
                    <div className="text-xs text-muted-foreground">{campaign.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatTypeLabel(campaign.type, t)}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {formatRewardSummary(campaign.reward)}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {campaign._count.participations}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                    <div>{new Date(campaign.startDate).toLocaleDateString()}</div>
                    {campaign.endDate && (
                      <div>~ {new Date(campaign.endDate).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(campaign)}
                        className="inline-flex items-center text-muted-foreground hover:text-foreground"
                        title={campaign.isActive ? "停用" : "启用"}
                      >
                        {campaign.isActive ? (
                          <ToggleRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => { setEditing(campaign); setOpen(true); }}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(campaign.id, campaign.title)}
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
            <DialogTitle>{editing ? t("editCampaign") : t("newCampaign")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("campaignTitle")}</label>
                <Input
                  name="title"
                  required
                  defaultValue={editing?.title}
                  placeholder="Google 好评送优惠券"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("campaignSlug")}</label>
                <Input
                  name="slug"
                  required
                  defaultValue={editing?.slug}
                  placeholder="google-review-reward"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">描述</label>
              <Input
                name="description"
                defaultValue={editing?.description || ""}
                placeholder="活动描述（选填）"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("campaignType")}</label>
              <select
                name="type"
                required
                defaultValue={editing?.type || "google_review"}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="google_review">{t("googleReviewType")}</option>
              </select>
            </div>

            {/* 奖励配置 */}
            <fieldset className="space-y-3 rounded-xl border border-border p-4">
              <legend className="px-2 text-sm font-medium">{t("campaignReward")}</legend>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("couponType")}</label>
                  <select
                    name="couponType"
                    defaultValue={editing?.reward?.couponType || "FIXED"}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="FIXED">{t("fixed")}</option>
                    <option value="PERCENT">{t("percent")}</option>
                    <option value="FREE_DELIVERY">{t("freeDelivery")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("couponValue")} (分)</label>
                  <Input
                    name="couponValue"
                    type="number"
                    defaultValue={editing?.reward?.couponValue ?? 300}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("couponMinOrder")} (分)</label>
                  <Input
                    name="couponMinOrder"
                    type="number"
                    defaultValue={editing?.reward?.couponMinOrder ?? 2000}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">优惠券描述</label>
                  <Input
                    name="couponDesc"
                    defaultValue={editing?.reward?.couponDesc || ""}
                    placeholder="Google好评奖励 $3"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            </fieldset>

            {/* 活动配置 - Google Review URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Google Maps 评价链接</label>
              <Input
                name="reviewUrl"
                defaultValue={(editing?.config as { reviewUrl?: string })?.reviewUrl || ""}
                placeholder="https://g.page/r/YOUR_GOOGLE_PLACE_ID/review"
                className="h-11 rounded-xl"
              />
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

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1 h-11">
                {loading ? tCommon("saving") : editing ? t("saveChanges") : t("newCampaign")}
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
