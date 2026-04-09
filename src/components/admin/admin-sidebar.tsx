"use client";

import { usePathname } from "next/navigation";
import { Package, ShoppingCart, LayoutDashboard, ArrowLeft, Grid3X3, Settings, Users, Ticket, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  const navItems = [
    { href: "/admin" as const, label: t("overview"), icon: LayoutDashboard },
    { href: "/admin/products" as const, label: t("products"), icon: Package },
    { href: "/admin/categories" as const, label: t("categories"), icon: Grid3X3 },
    { href: "/admin/orders" as const, label: t("orders"), icon: ShoppingCart },
    { href: "/admin/users" as const, label: t("users"), icon: Users },
    { href: "/admin/coupons" as const, label: t("coupons"), icon: Ticket },
    { href: "/admin/reviews" as const, label: t("reviews"), icon: Star },
    { href: "/admin/settings" as const, label: t("settings"), icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-56 border-r border-border bg-card md:block">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/admin" className="text-lg font-bold text-primary">
          {tCommon("brand")}
        </Link>
        <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {t("adminPanel")}
        </span>
      </div>

      <nav className="space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-3 right-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToFront")}
        </Link>
      </div>
    </aside>
  );
}
