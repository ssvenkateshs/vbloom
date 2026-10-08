import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { ThemePicker } from "@/components/ThemePicker";
import { themeBootScript } from "@/components/themeBoot";
import { company } from "@/content/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vbloom.com";
const title = `${company.name}: ${company.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s | ${company.name}` },
  description: company.description,
  keywords: [
    "IT services",
    "digital transformation",
    "artificial intelligence",
    "data and analytics",
    "cloud and infrastructure",
    "application services",
    "enterprise solutions",
    "managed IT services",
    company.name,
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: company.name,
    title,
    description: company.description,
  },
  twitter: { card: "summary_large_image", title, description: company.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0912",
  viewportFit: "cover",
};

/** Marks JavaScript as running before first paint, so reveal animations can hide content safely. */
const jsFlag = `document.documentElement.classList.add("js");`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag + themeBootScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <ThemePicker />
      </body>
    </html>
  );
}
