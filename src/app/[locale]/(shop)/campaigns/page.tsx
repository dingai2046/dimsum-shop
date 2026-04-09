import { prisma } from "@/lib/prisma";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Gift, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "活动专区 | 東方點心",
  description: "参加活动，领取优惠券和专属福利。Google 好评送优惠券，分享有礼等更多活动等你来参加。",
};

// 奖励配置类型
interface CampaignReward {
  couponValue?: number;
  couponDesc?: string;
}

interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image: string | null;
  type: string;
  reward: CampaignReward;
  isActive: boolean;
  startDate: Date;
  endDate: Date | null;
}

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    where: {
      isActive: true,
      startDate: { lte: new Date() },
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return <CampaignsContent campaigns={campaigns as Campaign[]} />;
}

function CampaignsContent({ campaigns }: { campaigns: Campaign[] }) {
  const t = useTranslations("campaigns");

  if (campaigns.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Gift className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("empty")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* 页面标题 */}
      <div className="mb-6 flex items-center gap-3 md:mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Gift className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold md:text-3xl">{t("title")}</h1>
      </div>

      {/* 活动网格 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const t = useTranslations("campaigns");
  const reward = campaign.reward as CampaignReward;
  const rewardValue = reward?.couponValue ? (reward.couponValue / 100).toFixed(0) : "3";

  // 根据活动类型选择渐变色和图标
  const typeConfig: Record<string, { gradient: string; emoji: string }> = {
    google_review: {
      gradient: "from-red-500/15 via-amber-500/10 to-yellow-500/15",
      emoji: "⭐",
    },
    share: {
      gradient: "from-blue-500/15 via-purple-500/10 to-pink-500/15",
      emoji: "🔗",
    },
    checkin: {
      gradient: "from-green-500/15 via-emerald-500/10 to-teal-500/15",
      emoji: "📍",
    },
  };

  const config = typeConfig[campaign.type] || typeConfig.google_review;

  return (
    <Link href={`/campaigns/${campaign.slug}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-card transition-all hover:border-primary/25 hover:shadow-md">
        {/* 渐变横幅 */}
        <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${config.gradient}`}>
          <span className="text-5xl">{config.emoji}</span>
          {/* 奖励角标 */}
          <div className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm">
            ${rewardValue} OFF
          </div>
        </div>

        {/* 内容 */}
        <div className="p-4">
          <h3 className="mb-1.5 text-lg font-bold leading-tight">{campaign.title}</h3>
          {campaign.description && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {campaign.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t("rewardPreview", { value: rewardValue })}
            </span>
            <span className="flex items-center gap-1 text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
              {t("viewDetail")}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
