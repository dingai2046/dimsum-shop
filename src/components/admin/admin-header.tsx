"use client";

import Link from "next/link";
import { Menu, Package, ShoppingCart, LayoutDashboard, ArrowLeft, Grid3X3, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "概览", icon: LayoutDashboard },
  { href: "/admin/products", label: "产品管理", icon: Package },
  { href: "/admin/categories", label: "分类管理", icon: Grid3X3 },
  { href: "/admin/orders", label: "订单管理", icon: ShoppingCart },
  { href: "/admin/settings", label: "站点设置", icon: Settings },
];

export function AdminHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/admin" className="text-lg font-bold text-primary">
          東方點心
        </Link>
        <button
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {menuOpen && (
        <nav className="border-t border-border p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            返回前台
          </Link>
        </nav>
      )}
    </header>
  );
}
