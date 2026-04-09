import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { GoogleReviewCampaign } from "@/components/shop/google-review-campaign";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
  });

  if (!campaign) {
    return { title: "活动不存在" };
  }

  return {
    title: `${campaign.title} | 東方點心`,
    description: campaign.description || "参加活动领取专属优惠",
  };
}

export default async function CampaignDetailPage({ params }: Props) {
  const { slug } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { slug },
  });

  if (!campaign || !campaign.isActive) {
    notFound();
  }

  // 检查用户参与状态
  const session = await auth();
  let participation = null;
  if (session?.user?.id) {
    participation = await prisma.campaignParticipation.findUnique({
      where: {
        campaignId_userId: {
          campaignId: campaign.id,
          userId: session.user.id,
        },
      },
    });
  }

  const config = campaign.config as { reviewUrl?: string } | null;
  const reward = campaign.reward as { couponValue?: number; couponDesc?: string };

  return (
    <CampaignDetailContent
      campaign={{
        id: campaign.id,
        slug: campaign.slug,
        title: campaign.title,
        description: campaign.description,
        type: campaign.type,
        reward,
        config,
      }}
      participation={
        participation
          ? {
              status: participation.status,
              couponId: participation.couponId,
            }
          : null
      }
      isLoggedIn={!!session?.user}
    />
  );
}

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

function CampaignDetailContent({
  campaign,
  participation,
  isLoggedIn,
}: {
  campaign: CampaignInfo;
  participation: ParticipationInfo | null;
  isLoggedIn: boolean;
}) {
  const t = useTranslations("campaigns");

  // 如果不是 google_review 类型，显示通用页面
  if (campaign.type !== "google_review") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <h1 className="mb-4 text-2xl font-bold">{campaign.title}</h1>
        {campaign.description && (
          <p className="text-muted-foreground">{campaign.description}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
      <GoogleReviewCampaign
        campaign={campaign}
        participation={participation}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
