"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { User, LogOut, ClipboardList, Gift } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const { data: session } = useSession();
  const t = useTranslations("nav");

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-shadow ${scrolled ? "shadow-sm" : ""}`}>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="東方點心 Dong Fang Dim Sum"
            width={52}
            height={52}
            className="h-10 w-10 md:h-12 md:w-12 object-contain"
            priority
          />
        </Link>

        {/* 桌面端导航 */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            {t("menu")}
          </Link>
          <Link
            href="/account/orders"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("orders")}
          </Link>
          <Link
            href="/campaigns"
            className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            <Gift className="h-3.5 w-3.5" />
            {t("campaigns")}
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("about")}
          </Link>
        </nav>

        {/* 右侧操作 */}
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />

          <Link href="/account/orders" className="md:hidden">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <ClipboardList className="h-5 w-5" />
            </Button>
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-1">
              <Link href="/account">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="hidden text-muted-foreground md:flex"
                onClick={() => signOut()}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="text-sm text-muted-foreground">
                {t("login")}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
