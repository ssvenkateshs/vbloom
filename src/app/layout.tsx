import type { Metadata, Viewport } from "next";
import { Inter, Orbitron, Sora } from "next/font/google";
import type { ReactNode } from "react";
import { company } from "@/content/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"], display: "swap" });
const orbitron = Orbitron({ variable: "--font-orbitron", subsets: ["latin"], display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vbloom.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${company.name}: ${company.tagline}`,
    template: `%s | ${company.name}`,
  },
  description: company.description,
  keywords: [
    "AI",
    "digital transformation",
    "intelligent automation",
    "enterprise applications",
    "data and analytics",
    "cloud",
    "managed services",
    company.name,
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: company.name,
    title: `${company.name}: ${company.tagline}`,
    description: company.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${company.name}: ${company.tagline}`,
    description: company.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#02030a",
  colorScheme: "dark",
  viewportFit: "cover",
};

/** Marks JavaScript as running before first paint, so reveal animations can hide content safely. */
const jsFlag = `document.documentElement.classList.add("js");`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} ${orbitron.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
