import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Plus, Check } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAddressesByUserId } from "@/lib/api/addresses";
import { AddressActions } from "@/components/shop/address-actions";

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/addresses");

  const addresses = await getAddressesByUserId(session.user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/account"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        个人中心
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">地址管理</h1>
        <AddressActions />
      </div>

      {addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="rounded-2xl bg-card p-5 shadow-sm relative"
            >
              {addr.isDefault && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <Check className="h-3 w-3" />
                  默认
                </span>
              )}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{addr.name}</span>
                    <span className="text-sm text-muted-foreground">{addr.phone}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {addr.province}{addr.city}{addr.district}{addr.detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">还没有添加收货地址</p>
        </div>
      )}
    </div>
  );
}
