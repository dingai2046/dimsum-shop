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
  description: "Handmade dim sum wholesale & retail in Sydney. Xiao Long Bao, dumplings, wontons, siu mai. Traditional craftsmanship, freshly made.",
  keywords: ["点心", "dim sim", "dim sum", "水饺", "dumplings", "小笼包", "Sydney", "South Hurstville", "中式点心", "東方點心"],
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    siteName: "東方點心 Dong Fang Dim Sim",
    title: "東方點心 | Dong Fang Dim Sim",
    description: "Handmade dim sum wholesale & retail in Sydney.",
    images: [{ url: "/images/hero/dimsum-hero.jpg", width: 1200, height: 630, alt: "東方點心" }],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

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
  servesCuisine: "Chinese",
  priceRange: "$$",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
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
