import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  MapPin,
  Star,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { getOrdersByUserId } from "@/lib/api/orders";
import { Button } from "@/components/ui/button";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const orders = await getOrdersByUserId(session.user.id);
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const paidCount = orders.filter((o) => o.status === "PAID" || o.status === "CONFIRMED" || o.status === "PREPARING").length;
  const deliveringCount = orders.filter((o) => o.status === "READY" || o.status === "DELIVERING").length;

  const menuItems = [
    { href: "/account/orders", label: "我的订单", desc: `${orders.length} 个订单`, icon: Package },
    { href: "/account/addresses", label: "地址管理", desc: "管理收货地址", icon: MapPin },
    { href: "/account/points", label: "我的积分", desc: "0 积分可用", icon: Star },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* 用户信息卡片 */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
            {session.user.name?.charAt(0) || "U"}
          </div>
          <div>
            <h1 className="text-xl font-bold">{session.user.name || "用户"}</h1>
            <p className="text-sm text-primary-foreground/70">{session.user.email}</p>
          </div>
        </div>

        {/* 订单快捷入口 */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Link href="/account/orders?status=PENDING" className="rounded-xl bg-white/10 p-3 hover:bg-white/20 transition-colors">
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-xs text-primary-foreground/70">待支付</p>
          </Link>
          <Link href="/account/orders?status=PREPARING" className="rounded-xl bg-white/10 p-3 hover:bg-white/20 transition-colors">
            <p className="text-2xl font-bold">{paidCount}</p>
            <p className="text-xs text-primary-foreground/70">制作中</p>
          </Link>
          <Link href="/account/orders?status=DELIVERING" className="rounded-xl bg-white/10 p-3 hover:bg-white/20 transition-colors">
            <p className="text-2xl font-bold">{deliveringCount}</p>
            <p className="text-xs text-primary-foreground/70">配送中</p>
          </Link>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="mt-6 rounded-2xl bg-card shadow-sm overflow-hidden">
        {menuItems.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted ${
              i < menuItems.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      {/* 退出登录 */}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-6"
      >
        <Button
          type="submit"
          variant="outline"
          className="w-full h-12 rounded-xl gap-2 text-muted-foreground"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </Button>
      </form>
    </div>
  );
}
