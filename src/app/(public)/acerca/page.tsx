import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { buttonClassName } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";
import { publicMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = publicMetadata({
  title: "Acerca de Respondi",
  description:
    "Respondi nació para que los pequeños negocios de Ecuador automaticen las preguntas repetidas de WhatsApp y recuperen tiempo. El servicio está en español.",
  path: "/acerca",
});

export default function AboutPage() {
  const contactHref = site.contactEmail
    ? `mailto:${site.contactEmail}`
    : "#contacto";

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-6">
      <Breadcrumbs items={[{ name: "Acerca de Respondi", path: "/acerca" }]} />
      <h1 className="text-page-title">Acerca de Respondi</h1>
      <p className="text-body text-ink">
        Respondi nació para resolver algo cotidiano en los pequeños negocios:
        contestar las mismas preguntas de WhatsApp mientras atiendes clientes,
        das una clase o estás haciendo una entrega.
      </p>
      <p className="text-body text-ink">
        Creamos Respondi para que puedas automatizar esas respuestas con la
        información de tu negocio y recuperar tiempo en tu día. Empezamos con
        pequeños negocios en Ecuador y ofrecemos el servicio en español.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink
          href="/registro"
          data-analytics-event={ANALYTICS_EVENTS.SIGNUP_CTA_CLICK}
          data-analytics-source={ANALYTICS_SOURCES.ABOUT_PAGE}
        >
          Crear mi cuenta
        </ButtonLink>
        <a href={contactHref} className={buttonClassName("secondary")}>
          Contactar a Respondi
        </a>
      </div>
      <p id="contacto" className="scroll-mt-24 text-body text-ink">
        <strong className="font-semibold">Contacto comercial y soporte:</strong>{" "}
        {site.contactEmail ? (
          <a
            href={`mailto:${site.contactEmail}`}
            className="font-semibold text-brand underline underline-offset-4"
          >
            {site.contactEmail}
          </a>
        ) : (
          "[correo comercial o de soporte confirmado]"
        )}
        . El contacto para ejercer derechos de protección de datos aparece
        también en la Política de privacidad.
      </p>
    </article>
  );
}
