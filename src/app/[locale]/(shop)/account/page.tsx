import { redirect } from "next/navigation";
import {
  Package,
  MapPin,
  Star,
  Heart,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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

  return <AccountPageContent
    user={session.user}
    orders={orders}
    pendingCount={pendingCount}
    paidCount={paidCount}
    deliveringCount={deliveringCount}
    signOutAction={async () => {
      "use server";
      await signOut({ redirectTo: "/" });
    }}
  />;
}

function AccountPageContent({
  user,
  orders,
  pendingCount,
  paidCount,
  deliveringCount,
  signOutAction,
}: {
  user: { name?: string | null; email?: string | null };
  orders: unknown[];
  pendingCount: number;
  paidCount: number;
  deliveringCount: number;
  signOutAction: () => Promise<void>;
}) {
  const t = useTranslations("account");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const menuItems = [
    { href: "/account/orders" as const, label: t("myOrders"), desc: t("ordersDesc", { count: orders.length }), icon: Package },
    { href: "/account/favorites" as const, label: t("myFavorites"), desc: t("favoritesDesc"), icon: Heart },
    { href: "/account/addresses" as const, label: t("addressManage"), desc: t("addressDesc"), icon: MapPin },
    { href: "/account/points" as const, label: t("myPoints"), desc: t("pointsDesc", { count: 0 }), icon: Star },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* 用户信息卡片 */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
            {user.name?.charAt(0) || "U"}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user.name || tCommon("user")}</h1>
            <p className="text-sm text-primary-foreground/70">{user.email}</p>
          </div>
        </div>

        {/* 订单快捷入口 */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Link href="/account/orders?status=PENDING" className="rounded-xl bg-white/10 p-3 hover:bg-white/20 transition-colors">
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-xs text-primary-foreground/70">{t("pending")}</p>
          </Link>
          <Link href="/account/orders?status=PREPARING" className="rounded-xl bg-white/10 p-3 hover:bg-white/20 transition-colors">
            <p className="text-2xl font-bold">{paidCount}</p>
            <p className="text-xs text-primary-foreground/70">{t("preparing")}</p>
          </Link>
          <Link href="/account/orders?status=DELIVERING" className="rounded-xl bg-white/10 p-3 hover:bg-white/20 transition-colors">
            <p className="text-2xl font-bold">{deliveringCount}</p>
            <p className="text-xs text-primary-foreground/70">{t("delivering")}</p>
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
        action={signOutAction}
        className="mt-6"
      >
        <Button
          type="submit"
          variant="outline"
          className="w-full h-12 rounded-xl gap-2 text-muted-foreground"
        >
          <LogOut className="h-4 w-4" />
          {tNav("logout")}
        </Button>
      </form>
    </div>
  );
}
