import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { getSiteSettings } from "@/lib/api/site-settings";

export const metadata: Metadata = {
  title: "关于我们",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const { about, contact } = settings;

  return <AboutContent about={about} contact={contact} />;
}

function AboutContent({ about, contact }: {
  about: { title: string; subtitle: string; highlights: { value: string; label: string }[]; content: string };
  contact: { address: string; phone: string; email: string; hours: string };
}) {
  const t = useTranslations("about");
  const tFooter = useTranslations("footer");
  const tCommon = useTranslations("common");

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[280px] overflow-hidden">
        <Image
          src="/images/hero/dimsum-hero.jpg"
          alt={tCommon("brand")}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative mx-auto flex h-full max-w-7xl items-end px-5 pb-10">
          <div>
            <h1 className="text-3xl font-bold text-white md:text-5xl">{about.title}</h1>
            <p className="mt-2 text-white/70">{about.subtitle}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        {/* 亮点数据 */}
        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {about.highlights.map((h) => (
            <div key={h.label} className="rounded-2xl bg-card p-5 text-center shadow-sm">
              <p className="text-2xl font-bold text-primary md:text-3xl">{h.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{h.label}</p>
            </div>
          ))}
        </div>

        {/* 正文 */}
        <div className="prose prose-lg max-w-none">
          {about.content.split("\n\n").map((paragraph, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        {/* 联系信息 */}
        <div className="mt-12 rounded-2xl bg-muted/50 p-8">
          <h2 className="mb-6 text-xl font-bold">{t("contactUs")}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{tFooter("address")}</p>
                <p className="text-sm text-muted-foreground">{contact.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{tFooter("phone")}</p>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="text-sm text-muted-foreground hover:text-primary">
                  {contact.phone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{tFooter("emailLabel")}</p>
                <a href={`mailto:${contact.email}`} className="text-sm text-muted-foreground hover:text-primary">
                  {contact.email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{tFooter("hoursLabel")}</p>
                <p className="text-sm text-muted-foreground">{contact.hours}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
