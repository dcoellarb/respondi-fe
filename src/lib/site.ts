const configuredUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const siteUrl = configuredUrl.endsWith("/")
  ? configuredUrl.slice(0, -1)
  : configuredUrl;

export const site = {
  name: "Respondi",
  title: "Respondi | Respuestas automáticas por WhatsApp para tu negocio",
  description:
    "Automatiza las preguntas frecuentes de tus clientes por WhatsApp y recupera tiempo para tu negocio con Respondi",
  locale: "es-EC",
  url: siteUrl,
  priceLabel: "Desde USD 9.99 al mes",
  priceAmount: "9.99",
  priceCurrency: "USD",
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "dcoellar@gmail.com",
  privacyEmail:
    process.env.NEXT_PUBLIC_PRIVACY_EMAIL?.trim() || "dcoellar@gmail.com",
  legalName: "Daniel Coellar",
  legalIdLabel: "cédula de identidad",
  legalId: "0102981603",
  legalDomicile: "Ecuador",
  termsVersion: "1.0",
  termsEffectiveDate: "23 de noviembre de 2026",
} as const;

export function absoluteUrl(path: string) {
  return new URL(path, site.url).toString();
}
