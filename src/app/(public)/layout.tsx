import type { ReactNode } from "react";
import { PublicAnalytics } from "@/components/marketing/public-analytics";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { siteJsonLd } from "@/lib/structured-data";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <JsonLd data={siteJsonLd()} />
      <PublicAnalytics />
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-3 focus:text-label focus:ring-2 focus:ring-brand"
      >
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido">{children}</main>
      <SiteFooter />
    </>
  );
}
