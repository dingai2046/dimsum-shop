import { Header } from "@/components/shop/header";
import { BottomNav } from "@/components/shop/bottom-nav";
import { Footer } from "@/components/shop/footer";
import { Providers } from "@/components/shop/providers";
import { AnnouncementBar } from "@/components/shop/announcement-bar";
import { getSiteSettings } from "@/lib/api/site-settings";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <Providers>
      {settings.announcement.enabled && (
        <AnnouncementBar
          text={settings.announcement.text}
          link={settings.announcement.link}
          linkText={settings.announcement.linkText}
          type={settings.announcement.type}
        />
      )}
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav />
    </Providers>
  );
}
