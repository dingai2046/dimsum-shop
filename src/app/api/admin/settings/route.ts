import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SiteSettings } from "@/lib/api/site-settings";
import { defaultSettings } from "@/lib/api/site-settings";

// GET: 获取当前站点设置
export async function GET() {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    if (row) {
      // 合并数据库存储的设置与默认值（确保新增字段有默认值）
      const stored = row.data as Partial<SiteSettings>;
      const merged: SiteSettings = {
        announcement: { ...defaultSettings.announcement, ...stored.announcement },
        about: { ...defaultSettings.about, ...stored.about },
        contact: { ...defaultSettings.contact, ...stored.contact },
        hero: { ...defaultSettings.hero, ...stored.hero },
        brandPromise: { ...defaultSettings.brandPromise, ...stored.brandPromise },
      };
      return NextResponse.json(merged);
    }

    return NextResponse.json(defaultSettings);
  } catch (error) {
    console.error("获取站点设置失败:", error);
    return NextResponse.json({ error: "获取设置失败" }, { status: 500 });
  }
}

// PUT: 更新站点设置（需要 ADMIN 权限）
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const updates = (await request.json()) as Partial<SiteSettings>;

    // 先获取当前设置
    const existing = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    const currentData = (existing?.data as Partial<SiteSettings>) || {};

    // 深度合并：只更新传入的部分
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

    // 返回完整设置（合并默认值）
    const full: SiteSettings = {
      announcement: { ...defaultSettings.announcement, ...(row.data as Record<string, unknown>).announcement as object },
      about: { ...defaultSettings.about, ...(row.data as Record<string, unknown>).about as object },
      contact: { ...defaultSettings.contact, ...(row.data as Record<string, unknown>).contact as object },
      hero: { ...defaultSettings.hero, ...(row.data as Record<string, unknown>).hero as object },
      brandPromise: { ...defaultSettings.brandPromise, ...(row.data as Record<string, unknown>).brandPromise as object },
    };

    return NextResponse.json(full);
  } catch (error) {
    console.error("更新站点设置失败:", error);
    return NextResponse.json({ error: "更新设置失败" }, { status: 500 });
  }
}
