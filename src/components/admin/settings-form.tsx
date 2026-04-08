"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SiteSettings } from "@/lib/api/site-settings";

interface SettingsFormProps {
  settings: SiteSettings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"announcement" | "hero" | "about" | "contact" | "brand">("announcement");

  const tabs = [
    { key: "announcement" as const, label: "公告广播" },
    { key: "hero" as const, label: "首页 Hero" },
    { key: "about" as const, label: "关于我们" },
    { key: "contact" as const, label: "联系方式" },
    { key: "brand" as const, label: "品牌承诺" },
  ];

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    console.log(`保存 ${activeTab} 设置:`, Object.fromEntries(formData));
    alert("设置保存成功（Mock）");
    setLoading(false);
  }

  return (
    <div>
      {/* Tab 切换 */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 公告广播 */}
        {activeTab === "announcement" && (
          <div className="rounded-xl bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">公告广播设置</h2>
            <p className="text-sm text-muted-foreground">前台顶部显示的公告横幅</p>
            <label className="flex items-center gap-3">
              <input type="checkbox" name="enabled" defaultChecked={settings.announcement.enabled} className="h-4 w-4 rounded border-border" />
              <span className="text-sm font-medium">启用公告</span>
            </label>
            <div className="space-y-2">
              <label className="text-sm font-medium">公告内容</label>
              <Input name="text" defaultValue={settings.announcement.text} className="h-11 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">链接地址（可选）</label>
                <Input name="link" defaultValue={settings.announcement.link} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">链接文字</label>
                <Input name="linkText" defaultValue={settings.announcement.linkText} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">类型</label>
              <select name="type" defaultValue={settings.announcement.type} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                <option value="info">信息</option>
                <option value="promo">促销</option>
                <option value="warning">警告</option>
              </select>
            </div>
          </div>
        )}

        {/* 首页 Hero */}
        {activeTab === "hero" && (
          <div className="rounded-xl bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">首页 Hero 设置</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium">标语</label>
              <Input name="tagline" defaultValue={settings.hero.tagline} className="h-11 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">主标题</label>
                <Input name="title" defaultValue={settings.hero.title} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">副标题</label>
                <Input name="subtitle" defaultValue={settings.hero.subtitle} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">描述文字</label>
              <Input name="description" defaultValue={settings.hero.description} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">背景图片 URL</label>
              <Input name="image" defaultValue={settings.hero.image} className="h-11 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">主按钮文字</label>
                <Input name="ctaPrimaryText" defaultValue={settings.hero.ctaPrimary.text} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">次按钮文字</label>
                <Input name="ctaSecondaryText" defaultValue={settings.hero.ctaSecondary.text} className="h-11 rounded-xl" />
              </div>
            </div>
          </div>
        )}

        {/* 关于我们 */}
        {activeTab === "about" && (
          <div className="rounded-xl bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">关于我们</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium">页面标题</label>
              <Input name="aboutTitle" defaultValue={settings.about.title} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">副标题</label>
              <Input name="aboutSubtitle" defaultValue={settings.about.subtitle} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">内容</label>
              <textarea
                name="aboutContent"
                rows={8}
                defaultValue={settings.about.content}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        )}

        {/* 联系方式 */}
        {activeTab === "contact" && (
          <div className="rounded-xl bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">联系方式</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">电话</label>
                <Input name="phone" defaultValue={settings.contact.phone} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">邮箱</label>
                <Input name="email" defaultValue={settings.contact.email} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">地址</label>
              <Input name="address" defaultValue={settings.contact.address} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">营业时间</label>
              <Input name="hours" defaultValue={settings.contact.hours} className="h-11 rounded-xl" />
            </div>
            <h3 className="pt-2 text-sm font-semibold">社交平台</h3>
            {settings.contact.socials.map((s, i) => (
              <div key={s.name} className="grid grid-cols-3 gap-3">
                <Input name={`social_name_${i}`} defaultValue={s.name} placeholder="平台名" className="h-10 rounded-lg" />
                <Input name={`social_url_${i}`} defaultValue={s.url} placeholder="链接" className="h-10 rounded-lg col-span-2" />
              </div>
            ))}
          </div>
        )}

        {/* 品牌承诺 */}
        {activeTab === "brand" && (
          <div className="rounded-xl bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">品牌承诺区域</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium">标题</label>
              <Input name="brandTitle" defaultValue={settings.brandPromise.title} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">描述</label>
              <textarea
                name="brandDescription"
                rows={3}
                defaultValue={settings.brandPromise.description}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>
            <h3 className="pt-2 text-sm font-semibold">数据卡片</h3>
            {settings.brandPromise.stats.map((stat, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <Input name={`stat_value_${i}`} defaultValue={stat.value} placeholder="数值" className="h-10 rounded-lg" />
                <Input name={`stat_label_${i}`} defaultValue={stat.label} placeholder="标签" className="h-10 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        <Button type="submit" disabled={loading} className="h-11 px-8">
          {loading ? "保存中..." : "保存设置"}
        </Button>
      </form>
    </div>
  );
}
