"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const t = useTranslations("common");

  useEffect(() => {
    // 注册 Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // 检测是否已安装
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // 检测 iOS（iOS 没有 beforeinstallprompt 事件）
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua);
    setIsIOS(isiOS);

    // 检测是否已关闭过提示
    const dismissed = localStorage.getItem("pwa-dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    // Android/Chrome：监听安装提示
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS：延迟显示手动提示
    if (isiOS) {
      const timer = setTimeout(() => setShowBanner(true), 5000);
      return () => { clearTimeout(timer); window.removeEventListener("beforeinstallprompt", handler); };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    setShowBanner(false);
    localStorage.setItem("pwa-dismissed", Date.now().toString());
  }

  if (!showBanner) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 animate-fade-up px-4 md:left-1/2 md:right-auto md:max-w-md md:-translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl bg-foreground px-4 py-3 shadow-2xl">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary-foreground">
            {isIOS ? "添加到主屏幕" : "安装東方點心 App"}
          </p>
          <p className="text-xs text-primary-foreground/60">
            {isIOS
              ? "点击 Safari 分享按钮 → 添加到主屏幕"
              : "一键安装，像 App 一样使用"}
          </p>
        </div>
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-all active:scale-95"
          >
            安装
          </button>
        )}
        <button onClick={handleDismiss} className="shrink-0 rounded-full p-1.5 text-primary-foreground/40 hover:text-primary-foreground/70">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
