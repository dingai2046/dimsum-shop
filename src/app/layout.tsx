import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dongfangdimsim.com.au";

export const metadata: Metadata = {
  title: {
    default: "東方點心 | Dong Fang Dim Sim",
    template: "%s | 東方點心",
  },
  description: "悉尼手工点心批发零售。小笼包、水饺、云吞、烧卖，传统工艺现做现卖。South Hurstville 门店自提或外送。",
  keywords: ["点心", "dim sim", "dim sum", "水饺", "dumplings", "小笼包", "Sydney", "South Hurstville", "中式点心", "東方點心"],
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "東方點心 Dong Fang Dim Sim",
    title: "東方點心 | Dong Fang Dim Sim",
    description: "悉尼手工点心批发零售。小笼包、水饺、云吞、烧卖，传统工艺现做现卖。",
    images: [{ url: "/images/hero/dimsum-hero.jpg", width: 1200, height: 630, alt: "東方點心" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "東方點心 | Dong Fang Dim Sim",
    description: "悉尼手工点心批发零售。小笼包、水饺、云吞、烧卖，传统工艺现做现卖。",
  },
  alternates: {
    canonical: BASE_URL,
  },
};

// 结构化数据 — 本地商家
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "東方點心 Dong Fang Dim Sim",
  image: `${BASE_URL}/images/hero/dimsum-hero.jpg`,
  url: BASE_URL,
  telephone: "+61285914432",
  address: {
    "@type": "PostalAddress",
    streetAddress: "54 Connells Point Rd",
    addressLocality: "South Hurstville",
    addressRegion: "NSW",
    postalCode: "2221",
    addressCountry: "AU",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -33.9656,
    longitude: 151.1048,
  },
  servesCuisine: "Chinese",
  priceRange: "$$",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
