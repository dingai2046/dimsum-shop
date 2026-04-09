// 站点设置 — 后台可管理的全局内容
// 数据持久化到 site_settings 表，JSON 字段存储

import { prisma } from "@/lib/prisma";

export interface SiteSettings {
  // 公告广播
  announcement: {
    enabled: boolean;
    text: string;
    link?: string;
    linkText?: string;
    type: "info" | "promo" | "warning";
  };
  // 关于我们
  about: {
    title: string;
    subtitle: string;
    content: string; // Markdown 或纯文本
    highlights: { label: string; value: string }[];
  };
  // 联系方式
  contact: {
    address: string;
    phone: string;
    email: string;
    hours: string;
    wechatQr: string;
    socials: { name: string; url: string; icon: string }[];
  };
  // 首页 Hero
  hero: {
    tagline: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    ctaPrimary: { text: string; href: string };
    ctaSecondary: { text: string; href: string };
  };
  // 品牌承诺
  brandPromise: {
    title: string;
    description: string;
    stats: { value: string; label: string }[];
  };
}

export const defaultSettings: SiteSettings = {
  announcement: {
    enabled: true,
    text: "🎉 新店开业！全场满 $50 免运费，使用优惠码 WELCOME10 立减 $10",
    link: "/products",
    linkText: "立即选购 →",
    type: "promo",
  },
  about: {
    title: "關於東方點心",
    subtitle: "Dong Fang Dim Sim — Since 2020",
    content: `東方點心位于悉尼 South Hurstville，是一家专注于传统中式点心的外卖店铺。我们坚持手工制作每一只点心，从选材到成品，每一个环节都精益求精。

我们的师傅拥有超过20年的点心制作经验，传承正宗粤式与北方点心工艺。无论是鲜美多汁的小笼包，还是皮薄馅大的手工水饺，每一口都是对传统味道的致敬。

我们提供堂食外带和批发零售服务，欢迎餐厅、超市和个人客户前来选购。新鲜现做，品质保证。`,
    highlights: [
      { label: "创立年份", value: "2020" },
      { label: "点心种类", value: "18+" },
      { label: "日均出品", value: "500+" },
      { label: "服务方式", value: "Takeaway · 批發零售" },
    ],
  },
  contact: {
    address: "54 Connells Point Rd, South Hurstville, NSW 2221, Sydney",
    phone: "02 8591 4432",
    email: "hello@dongfangdimsim.com",
    hours: "周一至周日 9:00 - 21:00",
    wechatQr: "/images/contact/wechat-qr.svg",
    socials: [
      { name: "Instagram", url: "https://instagram.com/dongfangdimsim", icon: "instagram" },
      { name: "Facebook", url: "https://facebook.com/dongfangdimsim", icon: "facebook" },
      { name: "小红书", url: "https://xiaohongshu.com/dongfangdimsim", icon: "xiaohongshu" },
      { name: "TikTok", url: "https://tiktok.com/@dongfangdimsim", icon: "tiktok" },
    ],
  },
  hero: {
    tagline: "東方點心 · Dong Fang Dim Sim",
    title: "传统手工点心",
    subtitle: "温暖每一天",
    description: "精选优质食材，传承百年手艺。从蒸笼到餐桌，为你送上地道的中式美味。",
    image: "/images/hero/dimsum-hero.jpg",
    ctaPrimary: { text: "立即选购", href: "/products" },
    ctaSecondary: { text: "了解我们", href: "/about" },
  },
  brandPromise: {
    title: "每一只点心，都值得被认真对待",
    description: "从食材筛选到手工制作，从急速冷冻到冷链配送，我们在每个环节都坚持最高标准。只为让你在家也能吃到地道的点心味道。",
    stats: [
      { value: "18+", label: "手工点心种类" },
      { value: "当日", label: "新鲜食材直达" },
      { value: "-18°C", label: "全程冷链保鲜" },
      { value: "0", label: "防腐剂添加" },
    ],
  },
};

// 获取站点设置（从数据库读取，不存在则返回默认值）
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    if (row) {
      const stored = row.data as Partial<SiteSettings>;
      return {
        announcement: { ...defaultSettings.announcement, ...stored.announcement },
        about: { ...defaultSettings.about, ...stored.about },
        contact: { ...defaultSettings.contact, ...stored.contact },
        hero: { ...defaultSettings.hero, ...stored.hero },
        brandPromise: { ...defaultSettings.brandPromise, ...stored.brandPromise },
      };
    }

    return defaultSettings;
  } catch (error) {
    console.error("获取站点设置失败，使用默认值:", error);
    return defaultSettings;
  }
}

// 更新站点设置（写入数据库）
export async function updateSiteSettings(
  updates: Partial<SiteSettings>
): Promise<SiteSettings> {
  const existing = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  const currentData = (existing?.data as Partial<SiteSettings>) || {};

  // 合并更新
  const merged = { ...currentData };
  for (const key of Object.keys(updates) as (keyof SiteSettings)[]) {
    if (updates[key] !== undefined) {
      merged[key] = { ...(currentData[key] as Record<string, unknown>), ...updates[key] } as never;
    }
  }

  const row = await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", data: merged },
    update: { data: merged },
  });

  const stored = row.data as Partial<SiteSettings>;
  return {
    announcement: { ...defaultSettings.announcement, ...stored.announcement },
    about: { ...defaultSettings.about, ...stored.about },
    contact: { ...defaultSettings.contact, ...stored.contact },
    hero: { ...defaultSettings.hero, ...stored.hero },
    brandPromise: { ...defaultSettings.brandPromise, ...stored.brandPromise },
  };
}
