import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Check } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAddressesByUserId } from "@/lib/api/addresses";
import { AddressManager } from "@/components/shop/address-manager";

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

      <h1 className="mb-6 text-2xl font-bold">地址管理</h1>

      <AddressManager initialAddresses={addresses} />
    </div>
  );
}
