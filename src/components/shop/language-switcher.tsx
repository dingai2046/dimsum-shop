"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: "zh" | "en") {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center rounded-full bg-muted p-0.5 text-xs">
      <button
        onClick={() => switchLocale("zh")}
        className={cn(
          "rounded-full px-2 py-1 font-medium transition-all",
          locale === "zh"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        中
      </button>
      <button
        onClick={() => switchLocale("en")}
        className={cn(
          "rounded-full px-2 py-1 font-medium transition-all",
          locale === "en"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
    </div>
  );
}
