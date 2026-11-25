import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#F8F6EF",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: "%s | Respondi",
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  category: "business",
  openGraph: {
    type: "website",
    locale: "es_EC",
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-EC" className={sans.variable}>
      <body className="min-h-dvh bg-canvas font-sans text-body text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
