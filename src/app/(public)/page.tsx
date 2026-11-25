import Image from "next/image";
import Link from "next/link";
import { HeroShowcase } from "@/components/marketing/hero-showcase";
import { TextLink } from "@/components/marketing/text-link";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button-link";
import { faq } from "@/content/faq";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";
import { publicMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { faqJsonLd } from "@/lib/structured-data";

export const metadata = publicMetadata({
  title: site.title,
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

const steps = [
  {
    title: "Conecta tu WhatsApp",
    body: "Conecta el WhatsApp de tu negocio desde tu cuenta de Respondi.",
  },
  {
    title: "Cuéntanos lo básico",
    body: "Configura tus horarios, precios, ubicación y las respuestas que más repites.",
  },
  {
    title: "Activa las respuestas",
    body: "Respondi usa la información de tu negocio para contestar consultas frecuentes.",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqJsonLd()} />

      <section className="mx-auto grid w-full max-w-site items-center gap-6 px-4 py-6 md:grid-cols-[1.1fr_1fr] md:gap-[clamp(24px,5vw,76px)] md:px-12 md:py-16 lg:py-[84px]">
        <div className="flex flex-col items-start gap-4 md:gap-5">
          <h1 className="text-display text-ink">
            Menos mensajes,
            <br />
            <span className="text-brand">más tiempo para ti.</span>
          </h1>
          <p className="max-w-[50ch] text-lg leading-relaxed text-muted">
            Respondi responde automáticamente las preguntas frecuentes de tus
            clientes por WhatsApp. Tú defines qué decir sobre horarios, precios
            y ubicación. Respondi se encarga de repetirlo por ti.
          </p>
          <div className="flex w-full flex-wrap items-center gap-3 sm:gap-6">
            <ButtonLink
              href="/registro"
              data-analytics-event={ANALYTICS_EVENTS.SIGNUP_CTA_CLICK}
              data-analytics-source={ANALYTICS_SOURCES.HOME_HERO}
              className="min-h-12 gap-3 px-[18px] font-bold"
            >
              Crear mi cuenta <span aria-hidden="true">↗</span>
            </ButtonLink>
            <Link
              href="/#como-funciona"
              data-analytics-event={ANALYTICS_EVENTS.HOW_IT_WORKS_CLICK}
              data-analytics-source={ANALYTICS_SOURCES.HOME_HERO}
              className="inline-flex min-h-11 items-center text-label font-bold text-ink underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Ver cómo funciona ↓
            </Link>
          </div>
          <p className="text-[15px] font-bold text-ink">{site.priceLabel}</p>
        </div>
        <HeroShowcase />
      </section>

      <section
        id="como-funciona"
        className="scroll-mt-24 bg-mint py-10 md:py-20"
      >
        <div className="mx-auto flex w-full max-w-site flex-col gap-7 px-4 md:px-12">
          <h2 className="text-display-section text-ink">
            Responde lo de siempre,
            <br /> sin escribirlo cada vez.
          </h2>
          <ol className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-card border border-border bg-surface p-6"
              >
                <span className="mb-3 grid size-8 place-items-center rounded-full bg-mint text-label font-extrabold text-brand-hover">
                  {index + 1}
                </span>
                <h3 className="text-section text-ink">{step.title}</h3>
                <p className="mt-2 text-body text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-site items-center gap-6 px-4 py-10 md:grid-cols-2 md:gap-14 md:px-12 md:py-[84px]">
        <div className="order-1 flex flex-col gap-4 md:order-2">
          <h2 className="text-display-section text-ink">
            Respondi no guarda tus mensajes en su base de datos
          </h2>
          <p className="max-w-[50ch] text-lg leading-relaxed text-muted">
            <strong className="font-semibold text-ink">
              Respondi no guarda mensajes entrantes ni salientes en su base de
              datos.
            </strong>{" "}
            El contenido se procesa para generar y enviar la respuesta. La
            información que configuras sobre tu negocio se guarda para que
            puedas editarla y seguir usándola.
          </p>
          <TextLink href="/privacidad">Leer la política de privacidad</TextLink>
        </div>
        <Image
          src="/images/respondi/estudio-pilates.webp"
          alt="Dueña de un estudio de pilates tomando café en la recepción"
          width={1200}
          height={800}
          loading="lazy"
          sizes="(max-width: 700px) 100vw, (max-width: 1240px) 46vw, 560px"
          className="order-2 w-full rounded-media object-cover md:order-1"
        />
      </section>

      <section
        id="precio"
        className="scroll-mt-24 bg-brand-hover px-4 py-10 text-center text-white md:px-12 md:py-[68px]"
      >
        <div className="mx-auto flex w-full max-w-site flex-col items-center gap-2.5">
          <h2 className="text-display-section">Respondi para tu negocio</h2>
          <p className="mb-5 text-lg">
            Desde{" "}
            <strong className="text-[52px] font-extrabold leading-none tracking-tight">
              USD {site.priceAmount}
            </strong>{" "}
            al mes
          </p>
          <ButtonLink
            href="/registro"
            data-analytics-event={ANALYTICS_EVENTS.SIGNUP_CTA_CLICK}
            data-analytics-source={ANALYTICS_SOURCES.HOME_PRICING}
            className="min-h-12 bg-mint px-[18px] font-bold !text-brand-hover hover:bg-surface hover:!text-brand-hover active:bg-surface"
          >
            Crear mi cuenta <span aria-hidden="true">↗</span>
          </ButtonLink>
        </div>
      </section>

      <section aria-labelledby="preguntas" className="bg-canvas">
        <div className="mx-auto flex w-full max-w-site flex-col gap-4 px-4 py-10 md:px-12 md:py-16">
          <h2 id="preguntas" className="text-display-section text-ink">
            Preguntas frecuentes
          </h2>
          <div className="overflow-hidden rounded-card border border-border bg-surface">
            {faq.map((item) => (
              <details
                key={item.question}
                className="border-b border-border last:border-b-0"
              >
                <summary className="flex min-h-11 cursor-pointer list-none items-center px-4 py-3 text-label font-bold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand md:px-6 [&::-webkit-details-marker]:hidden">
                  {item.question}
                </summary>
                <p className="px-4 pb-4 text-body text-muted md:px-6">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mint">
        <div className="mx-auto flex w-full max-w-site flex-col items-start gap-4 px-4 py-10 md:px-12 md:py-16">
          <h2 className="text-display-section text-ink">
            Que WhatsApp siga atendiendo mientras tú haces lo tuyo.
          </h2>
          <ButtonLink
            href="/registro"
            data-analytics-event={ANALYTICS_EVENTS.SIGNUP_CTA_CLICK}
            data-analytics-source={ANALYTICS_SOURCES.HOME_FOOTER}
            className="min-h-12 gap-3 px-[18px] font-bold"
          >
            Crear mi cuenta <span aria-hidden="true">↗</span>
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
