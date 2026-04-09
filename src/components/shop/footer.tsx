import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

function SocialIcon({ name, href, children }: { name: string; href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
    >
      {children}
    </a>
  );
}

export function Footer() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const tProduct = useTranslations("product");

  return (
    <footer className="bg-foreground text-background">
      {/* 地图区域 */}
      <div className="w-full h-[280px] md:h-[320px]">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3311.8!2d151.0908!3d-33.9668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12b9a0a0a0a0a1%3A0x0!2s54+Connells+Point+Rd%2C+South+Hurstville+NSW+2221!5e0!3m2!1szh-CN!2sau!4v1"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={tCommon("brand")}
        />
      </div>

      {/* 信息区域 */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {/* 品牌 + 联系方式 */}
          <div>
            <h3 className="text-2xl font-black text-primary" style={{ fontFamily: "'KaiTi', 'STKaiti', 'SimKai', serif" }}>
              {tCommon("brand")}
            </h3>
            <p className="mt-0.5 text-xs font-semibold tracking-widest text-white/50 uppercase">
              {tCommon("brandEn")}
            </p>
            <p className="mt-1 text-xs text-white/40">{t("takeawayWholesale")}</p>

            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-white/70">
                  54 Connells Point Rd,<br />South Hurstville, NSW 2221, Sydney
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a href="tel:+61285914432" className="text-white/70 hover:text-white transition-colors">
                  02 8591 4432
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href="mailto:hello@dongfangdimsim.com" className="text-white/70 hover:text-white transition-colors">
                  hello@dongfangdimsim.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-white/70">
                  周一至周日 9:00 - 21:00
                </span>
              </div>
            </div>
          </div>

          {/* 快捷链接 */}
          <div>
            <h4 className="font-semibold">{t("quickLinks")}</h4>
            <nav className="mt-4 space-y-2.5">
              {[
                { href: "/products" as const, label: tProduct("allProducts") },
                { href: "/categories/baozi" as const, label: "包子系列" },
                { href: "/categories/jiaozi" as const, label: "饺子系列" },
                { href: "/categories/shaomai" as const, label: "烧卖系列" },
                { href: "/about" as const, label: tNav("about") },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-white/50 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 微信二维码 + 社交平台 */}
          <div>
            <h4 className="font-semibold">{t("followUs")}</h4>
            <div className="mt-4 flex gap-6">
              {/* 微信二维码 */}
              <div className="shrink-0">
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white p-2">
                  <Image
                    src="/images/contact/wechat-qr.svg"
                    alt={t("wechat")}
                    width={120}
                    height={120}
                  />
                </div>
                <p className="mt-2 text-center text-xs text-white/40">{t("scanWeChat")}</p>
              </div>

              {/* 社交平台 */}
              <div>
                <p className="mb-3 text-sm text-white/50">{t("socialMedia")}</p>
                <div className="flex flex-wrap gap-2">
                  {/* Instagram */}
                  <SocialIcon name="Instagram" href="https://instagram.com/dongfangdimsum">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </SocialIcon>

                  {/* Facebook */}
                  <SocialIcon name="Facebook" href="https://facebook.com/dongfangdimsum">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z"/>
                    </svg>
                  </SocialIcon>

                  {/* 小红书 */}
                  <SocialIcon name="小红书" href="https://xiaohongshu.com/dongfangdimsum">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </SocialIcon>

                  {/* TikTok */}
                  <SocialIcon name="TikTok" href="https://tiktok.com/@dongfangdimsum">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.12v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.86 4.48v-7.15a8.16 8.16 0 005.58 2.17v-3.45a4.85 4.85 0 01-3.77-1.66 4.83 4.83 0 003.77-3z"/>
                    </svg>
                  </SocialIcon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部版权 */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 pb-20 md:pb-5 flex flex-col items-center gap-2 text-xs text-white/30 md:flex-row md:justify-between">
          <p>{t("allRights", { year: new Date().getFullYear() })}</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">{t("privacyPolicy")}</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">{t("termsOfService")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
