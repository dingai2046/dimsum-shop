import { prisma } from "@/lib/prisma";
import { CampaignManager } from "@/components/admin/campaign-manager";

export default async function AdminCampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { participations: true },
      },
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">活动管理</h1>
      <CampaignManager campaigns={JSON.parse(JSON.stringify(campaigns))} />
    </div>
  );
}
