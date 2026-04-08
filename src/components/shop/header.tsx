"use client";

import Link from "next/link";
import { ShoppingBag, Search, User, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";

export function Header() {
  const { totalItems } = useCart();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16">
        {/* Logo — 模拟招牌风格 */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-2xl font-black tracking-tight text-primary md:text-3xl" style={{ fontFamily: "'KaiTi', 'STKaiti', 'SimKai', serif" }}>
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
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/products"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            全部点心
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            分类浏览
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
          <Link href="/search">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Button>
          </Link>

          {session?.user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/account">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => signOut()}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:block">
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
