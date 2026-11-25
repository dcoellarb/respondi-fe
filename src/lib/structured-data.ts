import { faq } from "@/content/faq";
import { absoluteUrl, site } from "@/lib/site";

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        name: site.name,
        url: site.url,
        description: site.description,
        inLanguage: site.locale,
      },
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: site.name,
        url: site.url,
        description: site.description,
        areaServed: "EC",
        email: site.contactEmail,
        founder: {
          "@type": "Person",
          name: site.legalName,
        },
      },
      {
        "@type": "SoftwareApplication",
        name: site.name,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        inLanguage: "es",
        url: site.url,
        description: site.description,
        offers: {
          "@type": "Offer",
          price: site.priceAmount,
          priceCurrency: site.priceCurrency,
          description: `${site.priceLabel}. El precio total, incluidos los impuestos aplicables, se muestra antes de pagar.`,
        },
      },
    ],
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
