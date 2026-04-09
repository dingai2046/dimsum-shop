import { Header } from "@/components/shop/header";
import { Footer } from "@/components/shop/footer";
import { Providers } from "@/components/shop/providers";
import { PWAInstall } from "@/components/shop/pwa-install";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <Header />
      <PWAInstall />
      <main className="flex-1">{children}</main>
      <Footer />
    </Providers>
  );
}
