"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Gift, MapPin, Star, PartyPopper, Copy, Check, LogIn, ExternalLink } from "lucide-react";

interface CampaignInfo {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  reward: { couponValue?: number; couponDesc?: string };
  config: { reviewUrl?: string } | null;
}

interface ParticipationInfo {
  status: string;
  couponId: string | null;
}

interface GoogleReviewCampaignProps {
  campaign: CampaignInfo;
  participation: ParticipationInfo | null;
  isLoggedIn: boolean;
}

export function GoogleReviewCampaign({
  campaign,
  participation,
  isLoggedIn,
}: GoogleReviewCampaignProps) {
  const t = useTranslations("campaigns");
  const rewardValue = campaign.reward?.couponValue
    ? (campaign.reward.couponValue / 100).toFixed(0)
    : "3";

  // 状态管理
  const [status, setStatus] = useState<
    "idle" | "loading" | "participated" | "claiming" | "rewarded"
  >(() => {
    if (!participation) return "idle";
    if (participation.status === "REWARDED") return "rewarded";
    if (participation.status === "COMPLETED" || participation.status === "PENDING")
      return "participated";
    return "idle";
  });

  const [couponCode, setCouponCode] = useState("");
  const [copied, setCopied] = useState(false);

  // 如果已领奖，获取优惠券码
  useEffect(() => {
    if (status === "rewarded" && participation?.couponId) {
      fetch(`/api/coupons/${participation.couponId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.code) setCouponCode(data.code);
        })
        .catch(() => {});
    }
  }, [status, participation?.couponId]);

  // 参与活动 - 前往 Google Maps 评价
  const handleParticipate = async () => {
    setStatus("loading");
    try {
      const res = await fetch(`/api/campaigns/${campaign.slug}/participate`, {
        method: "POST",
      });
      if (res.ok) {
        setStatus("participated");
        // 打开 Google Maps 评价链接
        const reviewUrl = campaign.config?.reviewUrl;
        if (reviewUrl) {
          window.open(reviewUrl, "_blank");
        }
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  };

  // 领取奖励
  const handleClaim = async () => {
    setStatus("claiming");
    try {
      const res = await fetch(`/api/campaigns/${campaign.slug}/claim`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.couponCode) {
        setCouponCode(data.couponCode);
        setStatus("rewarded");
      } else {
        setStatus("participated");
      }
    } catch {
      setStatus("participated");
    }
  };

  // 复制优惠码
  const handleCopy = async () => {
    if (!couponCode) return;
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
      {/* 红包风格头部横幅 */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-amber-500 px-6 py-8 text-white md:px-8 md:py-10">
        {/* 装饰圆点 */}
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10" />

        <div className="relative flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Gift className="h-7 w-7" />
          </div>
          <div>
            <h1 className="mb-1.5 text-xl font-bold md:text-2xl">{campaign.title}</h1>
            <p className="text-sm text-white/85 md:text-base">
              {t("rewardPreview", { value: rewardValue })}
            </p>
          </div>
        </div>
      </div>

      {/* 步骤指南 */}
      <div className="border-b border-border/50 px-6 py-6 md:px-8">
        <h2 className="mb-4 text-base font-semibold">{t("steps")}</h2>
        <div className="space-y-4">
          <StepItem
            number={1}
            icon={<MapPin className="h-4 w-4" />}
            text={t("step1")}
          />
          <StepItem
            number={2}
            icon={<span className="text-sm">⭐⭐⭐⭐⭐</span>}
            text={t("step2")}
            iconType="emoji"
          />
          <StepItem
            number={3}
            icon={<span className="text-base">🎉</span>}
            text={t("step3")}
            iconType="emoji"
          />
        </div>
      </div>

      {/* 操作区域 */}
      <div className="px-6 py-6 md:px-8">
        {/* 未登录 */}
        {!isLoggedIn && (
          <Link href="/login">
            <Button className="w-full gap-2" size="lg">
              <LogIn className="h-4 w-4" />
              {t("loginToJoin")}
            </Button>
          </Link>
        )}

        {/* 已登录，未参与 */}
        {isLoggedIn && status === "idle" && (
          <Button
            className="w-full gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md hover:from-red-700 hover:to-red-600"
            size="lg"
            onClick={handleParticipate}
          >
            <ExternalLink className="h-4 w-4" />
            {t("goToGoogle")}
          </Button>
        )}

        {/* 提交中 */}
        {isLoggedIn && status === "loading" && (
          <Button className="w-full" size="lg" disabled>
            {t("participating")}
          </Button>
        )}

        {/* 已参与，待领取 */}
        {isLoggedIn && status === "participated" && (
          <Button
            className="w-full gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md hover:from-amber-600 hover:to-yellow-600"
            size="lg"
            onClick={handleClaim}
          >
            <PartyPopper className="h-4 w-4" />
            {t("claimReward")}
          </Button>
        )}

        {/* 领取中 */}
        {isLoggedIn && status === "claiming" && (
          <Button className="w-full" size="lg" disabled>
            {t("claiming")}
          </Button>
        )}

        {/* 已领取 - 展示优惠码 */}
        {isLoggedIn && status === "rewarded" && (
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center gap-2 text-lg font-bold text-green-600">
              <PartyPopper className="h-5 w-5" />
              {t("rewarded")}
            </div>

            {couponCode && (
              <div className="mb-3 flex items-center justify-center gap-2">
                <div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 px-6 py-3">
                  <span className="font-mono text-xl font-bold tracking-wider text-primary">
                    {couponCode}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            )}

            <p className="text-sm text-muted-foreground">{t("couponHint")}</p>
          </div>
        )}
      </div>

      {/* 活动规则 */}
      <div className="border-t border-border/50 bg-muted/30 px-6 py-4 md:px-8">
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">{t("rules")}</h3>
        <ul className="space-y-1 text-xs text-muted-foreground/80">
          <li>&#8226; {t("rule1")}</li>
          <li>&#8226; {t("rule2")}</li>
          <li>&#8226; {t("rule3")}</li>
        </ul>
      </div>
    </div>
  );
}

// 步骤条目组件
function StepItem({
  number,
  icon,
  text,
  iconType = "lucide",
}: {
  number: number;
  icon: React.ReactNode;
  text: string;
  iconType?: "lucide" | "emoji";
}) {
  return (
    <div className="flex items-center gap-3">
      {/* 序号圆圈 */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
        {number}
      </div>
      {/* 图标 */}
      <div className={iconType === "lucide" ? "text-muted-foreground" : ""}>
        {icon}
      </div>
      {/* 文字 */}
      <span className="text-sm">{text}</span>
    </div>
  );
}
