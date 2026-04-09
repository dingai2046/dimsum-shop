"use client";

import Link from "next/link";
import { User, LogOut, ClipboardList } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="text-2xl font-black tracking-tight text-primary md:text-3xl"
            style={{ fontFamily: "'KaiTi', 'STKaiti', 'SimKai', serif" }}
          >
            東方點心
          </span>
          <div className="hidden flex-col md:flex">
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase leading-tight">
              Dong Fang
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase leading-tight">
              Dim Sim
            </span>
          </div>
        </Link>

        {/* 桌面端导航 */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            菜单
          </Link>
          <Link
            href="/account/orders"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            我的订单
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            关于我们
          </Link>
        </nav>

        {/* 右侧操作 */}
        <div className="flex items-center gap-1">
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
                登录
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
