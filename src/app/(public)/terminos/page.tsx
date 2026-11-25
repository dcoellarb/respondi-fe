import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { TextLink } from "@/components/marketing/text-link";
import { publicMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = publicMetadata({
  title: "Términos y condiciones",
  description: `Términos y condiciones de Respondi. Precio de lanzamiento: ${site.priceLabel}.`,
  path: "/terminos",
});

export default function TermsPage() {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-6">
      <Breadcrumbs
        items={[{ name: "Términos y condiciones", path: "/terminos" }]}
      />
      <h1 className="text-page-title">Términos y condiciones</h1>
      <p className="text-meta text-muted">
        Vigencia: {site.termsEffectiveDate} · Versión: {site.termsVersion}.
      </p>

      <section className="flex flex-col gap-3">
        <h2 className="text-section">Quién presta el servicio</h2>
        <p className="text-body text-ink">
          Respondi es un servicio prestado por {site.legalName},{" "}
          {site.legalIdLabel} {site.legalId}, con domicilio en{" "}
          {site.legalDomicile}, y contacto en{" "}
          <a
            href={`mailto:${site.contactEmail}`}
            className="font-semibold text-brand underline underline-offset-4"
          >
            {site.contactEmail}
          </a>
          . Al crear una cuenta aceptas estos Términos. Si actúas por un
          negocio, debes contar con autorización para hacerlo. La contratación
          de un plan y cualquier cargo se confirman en el proceso de
          suscripción.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-section">Qué incluye Respondi</h2>
        <p className="text-body text-ink">
          Respondi automatiza respuestas en español a consultas frecuentes
          recibidas por WhatsApp, usando la información que el negocio
          configura. Para activarlo debes vincular una cuenta compatible y
          mantener las autorizaciones correspondientes. La entrega de mensajes
          y algunas funciones dependen de WhatsApp y de la disponibilidad de
          sus servicios. Las respuestas automáticas pueden contener errores.
          Revisa y actualiza la información de tu negocio y atiende las
          consultas que requieran intervención humana.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-section">Cuenta y uso permitido</h2>
        <p className="text-body text-ink">
          Protege tus credenciales, informa cualquier acceso no autorizado y
          conecta únicamente cuentas que estés autorizado a gestionar. Usa
          Respondi de conformidad con la ley y las políticas de WhatsApp.
          Quedan prohibidos el envío de spam, la suplantación, el fraude y el
          uso del servicio para recopilar o tratar datos de forma ilícita. El
          negocio conserva la titularidad de la información que proporciona y
          autoriza su uso para prestar el servicio contratado.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-section">Suscripción, cobros y cancelación</h2>
        <p className="text-body text-ink">
          El precio de lanzamiento es desde USD {site.priceAmount} mensuales. El
          precio total, con los impuestos aplicables, se muestra antes de pagar.
          La suscripción
          se renueva de forma automática cada mes hasta que la canceles. El
          primer cobro se realiza al confirmar la contratación del plan. Los
          medios de pago y la facturación disponibles se muestran en el
          proceso de suscripción. El plan incluye las respuestas automáticas
          por WhatsApp con la información que configures sobre tu negocio.
        </p>
        <p className="text-body text-ink">
          Puedes cancelar desde tu cuenta de Respondi o escribiendo a{" "}
          <a
            href={`mailto:${site.contactEmail}`}
            className="font-semibold text-brand underline underline-offset-4"
          >
            {site.contactEmail}
          </a>
          . La cancelación surte efecto al final del período ya pagado. Hasta
          esa fecha mantienes el acceso. Los cargos pendientes deben
          liquidarse. Las devoluciones y reclamos se atienden caso por caso
          conforme a la ley. Se respetan los derechos que corresponden por
          ley.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-section">
          Costos de Meta y WhatsApp Business Platform
        </h2>
        <p className="text-body text-ink">
          Al conectar WhatsApp, Meta (WhatsApp Business Platform / Cloud API)
          puede pedirte que agregues un método de pago en tu cuenta de Meta.
          Ese método de pago lo gestionas tú directamente con Meta.{" "}
          <strong className="font-semibold">
            Respondi no cobra por los mensajes de Meta, no administra ese medio
            de pago y no es responsable de los cargos que Meta aplique a tu
            método de pago, ni del uso que Meta haga de esos datos de pago.
          </strong>
        </p>
        <p className="text-body text-ink">
          Según la política de precios vigente de Meta, cada número de negocio
          suele incluir un cupo mensual gratuito de mensajes de servicio (hoy:
          los primeros 1.000 mensajes de servicio por mes y por número). Los
          planes básicos de Respondi están pensados para mantener el uso dentro
          de ese tipo de cupo, de modo que, en condiciones normales de
          mensajes de servicio y sin exceder ese límite, no deberían generarse
          cargos de Meta por esos mensajes. Meta puede cambiar sus reglas,
          cupos y tarifas en cualquier momento.
        </p>
        <p className="text-body text-ink">
          Planes o volúmenes mayores, el envío de plantillas (por ejemplo
          marketing, utilidad o autenticación) u otros usos fuera del cupo
          gratuito pueden generar gastos facturados por Meta según sus
          condiciones. Esos cargos, si los hubiera, son entre tú y Meta; no
          forman parte del precio de Respondi y Respondi no los reembolsa.
        </p>
        <p className="text-body text-ink">
          Consulta las condiciones y precios oficiales de Meta, que prevalecen
          sobre cualquier resumen aquí:{" "}
          <a
            href="https://developers.facebook.com/docs/whatsapp/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand underline underline-offset-4"
          >
            Precios de WhatsApp Business Platform
          </a>
          {" · "}
          <a
            href="https://www.whatsapp.com/legal/business-terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand underline underline-offset-4"
          >
            Términos de WhatsApp Business
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-section">Datos y mensajes</h2>
        <p className="text-body text-ink">
          Respondi no guarda en su base de datos los mensajes entrantes ni
          salientes. El contenido se procesa para prestar el servicio según la{" "}
          <TextLink href="/privacidad">Política de privacidad</TextLink> y,
          cuando corresponda, el acuerdo de encargo de tratamiento entre
          Respondi y el negocio. El negocio debe contar con una base legítima
          para tratar los datos de sus clientes y facilitarles la información
          aplicable.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-section">Suspensión, cierre y cambios</h2>
        <p className="text-body text-ink">
          Podemos suspender el servicio por uso ilícito, riesgo de seguridad o
          incumplimiento de pago, con aviso y oportunidad de subsanar cuando
          corresponda. Informaremos los cambios relevantes y su fecha de
          vigencia por correo electrónico a la dirección de tu cuenta o
          mediante un aviso visible en el servicio. El cierre de la cuenta y
          el tratamiento posterior de los datos se rigen por la{" "}
          <TextLink href="/privacidad">Política de privacidad</TextLink> y el
          acuerdo aplicable.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-section">Reclamos</h2>
        <p className="text-body text-ink">
          Escríbenos a{" "}
          <a
            href={`mailto:${site.contactEmail}`}
            className="font-semibold text-brand underline underline-offset-4"
          >
            {site.contactEmail}
          </a>{" "}
          para consultas sobre el servicio, cobros o cancelaciones. Se aplica
          la legislación ecuatoriana, sin limitar los derechos ni las vías de
          reclamación que correspondan.
        </p>
      </section>
    </article>
  );
}
