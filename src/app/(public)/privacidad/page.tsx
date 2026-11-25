import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { publicMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = publicMetadata({
  title: "Política de privacidad",
  description:
    "Política de privacidad de Respondi. Respondi no guarda en su base de datos los mensajes de WhatsApp ni las respuestas que envía.",
  path: "/privacidad",
});

const dataRows = [
  {
    data: "Identificación, correo y datos del negocio proporcionados al registrarte",
    purpose: "Crear y administrar la cuenta, autenticar y prestar el servicio",
    basis: "Gestión precontractual y ejecución del contrato",
    retention:
      "Mientras la cuenta esté activa y hasta 5 años después de su cierre, cuando corresponda por obligaciones legales.",
  },
  {
    data: "Configuración del negocio y datos de conexión de WhatsApp proporcionados por el negocio u obtenidos mediante la integración",
    purpose: "Operar las respuestas configuradas y mantener la conexión",
    basis:
      "Ejecución del contrato para datos del titular, instrucciones del negocio para los datos que trate por encargo",
    retention:
      "Mientras la conexión esté activa. Tras desconectar o cerrar la cuenta, se eliminan o anonimizan en un plazo máximo de 30 días, salvo obligación legal de conservación.",
  },
  {
    data: "Contenido entrante, respuesta saliente y datos de enrutamiento recibidos o generados durante el servicio",
    purpose:
      "Interpretar la consulta y enviar la respuesta por cuenta del negocio",
    basis:
      "Instrucciones del responsable y base jurídica determinada por el negocio",
    retention:
      "Sin almacenamiento de mensajes en la base de datos de Respondi. El contenido se procesa de forma transitoria para generar y enviar la respuesta. No conservamos metadatos de conversación más allá de lo necesario para la operación inmediata del envío.",
  },
  {
    data: "Datos de facturación y estado de pago, suministrados por ti o por el proveedor de pagos",
    purpose: "Cobrar, facturar y cumplir obligaciones legales",
    basis: "Ejecución contractual y obligación legal, según finalidad",
    retention:
      "Hasta 7 años, o el plazo que exija la normativa tributaria y contable aplicable.",
  },
  {
    data: "Datos de contacto y solicitudes enviados a soporte",
    purpose: "Atender consultas, incidencias y reclamos",
    basis: "Interés legítimo y, cuando corresponda, ejecución del contrato",
    retention: "Hasta 2 años desde el cierre de la solicitud.",
  },
  {
    data: "Registros técnicos y cookies, cuando se utilicen",
    purpose:
      "Seguridad del servicio, mantenimiento de sesión y medición agregada del uso de la web pública",
    basis:
      "Interés legítimo para seguridad y sesión; consentimiento cuando la medición sea opcional",
    retention:
      "Registros técnicos de seguridad hasta 12 meses. Cookies de sesión hasta el cierre del navegador. Datos de medición agregada según la configuración del proveedor de analítica, sin contenido de mensajes ni datos de formularios.",
  },
];

export default function PrivacyPage() {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-6">
      <Breadcrumbs
        items={[{ name: "Política de privacidad", path: "/privacidad" }]}
      />
      <h1 className="text-page-title">Política de privacidad</h1>
      <p className="text-meta text-muted">
        Vigencia: {site.termsEffectiveDate} · Versión: {site.termsVersion}.
      </p>

      <section className="flex flex-col gap-3">
        <h2 className="text-section">Mensajes de WhatsApp</h2>
        <p className="text-body text-ink">
          <strong className="font-semibold">
            Respondi no guarda en su base de datos los mensajes que recibe tu
            negocio ni las respuestas que envía.
          </strong>{" "}
          Si conectas WhatsApp, Respondi procesa el contenido y los datos de
          envío necesarios para interpretar la consulta, generar la respuesta y
          enviarla. El tratamiento puede involucrar a WhatsApp y a los
          proveedores técnicos indicados más abajo. La conservación de chats en
          WhatsApp o en los dispositivos de sus usuarios depende de ese
          servicio y de la configuración de sus usuarios.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-section">Quién trata tus datos</h2>
        <p className="text-body text-ink">
          {site.legalName}, {site.legalIdLabel} {site.legalId}, con domicilio
          en {site.legalDomicile} y correo de privacidad{" "}
          <a
            href={`mailto:${site.privacyEmail}`}
            className="font-semibold text-brand underline underline-offset-4"
          >
            {site.privacyEmail}
          </a>
          , es responsable del tratamiento de los datos de la web y de la
          cuenta que usa para gestionar su relación contigo. Cuando Respondi
          procesa conversaciones por cuenta de un negocio y sigue sus
          instrucciones, el negocio determina la finalidad del tratamiento y
          Respondi actúa como encargado, conforme al acuerdo aplicable. Por
          ahora no hay un delegado de protección de datos designado; el
          contacto de privacidad es {site.privacyEmail}.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-section">Qué datos tratamos y para qué</h2>
        <div className="flex flex-col gap-4">
          {dataRows.map((row) => (
            <section
              key={row.data}
              className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4"
            >
              <h3 className="text-label text-ink">{row.data}</h3>
              <p className="text-body text-ink">
                <span className="font-semibold">Finalidad. </span>
                {row.purpose}
              </p>
              <p className="text-body text-ink">
                <span className="font-semibold">
                  Base prevista, sujeta a validación.{" "}
                </span>
                {row.basis}
              </p>
              <p className="text-body text-ink">
                <span className="font-semibold">Conservación. </span>
                {row.retention}
              </p>
            </section>
          ))}
        </div>
        <p className="text-body text-ink">
          Los datos obligatorios se identifican al solicitarlos. Si faltan los
          necesarios para crear una cuenta, conectar el número o emitir una
          factura, es posible que no podamos realizar esa acción. Puedes
          corregir datos inexactos escribiendo a{" "}
          <a
            href={`mailto:${site.privacyEmail}`}
            className="font-semibold text-brand underline underline-offset-4"
          >
            {site.privacyEmail}
          </a>{" "}
          o, cuando esté disponible, desde tu cuenta. Las respuestas se generan
          de forma automatizada usando la configuración del negocio. Esa
          automatización no perfila a las personas destinatarias ni toma
          decisiones con efectos jurídicos sobre ellas más allá de enviar la
          respuesta configurada por el negocio.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-section">Proveedores, transferencias y seguridad</h2>
        <p className="text-body text-ink">
          Para prestar el servicio podemos recurrir a WhatsApp (entrega de
          mensajes), proveedores de alojamiento e infraestructura,
          autenticación, pagos, correo y medición del uso de la web pública.
          Cada proveedor recibe solo los datos necesarios para su función. Si
          hay transferencias internacionales, se aplican las garantías
          previstas por la normativa ecuatoriana y los mecanismos contractuales
          correspondientes. Aplicamos medidas técnicas y organizativas
          razonables, como cifrado en tránsito, control de acceso y
          minimización de datos. La web puede usar cookies o tecnologías
          similares para sesión, seguridad y, si se habilita, medición
          agregada. Las tecnologías opcionales de medición no reciben
          contenido de mensajes ni datos de formularios. Puedes gestionar las
          cookies desde tu navegador.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-section">Derechos y contacto</h2>
        <p className="text-body text-ink">
          Según corresponda, puedes solicitar acceso, rectificación y
          actualización, eliminación, oposición, suspensión del tratamiento,
          portabilidad y revisión de decisiones automatizadas, y retirar el
          consentimiento donde sea la base del tratamiento. Escríbenos a{" "}
          <a
            href={`mailto:${site.privacyEmail}`}
            className="font-semibold text-brand underline underline-offset-4"
          >
            {site.privacyEmail}
          </a>
          . Procuramos responder en un plazo máximo de 15 días hábiles. Si tu
          solicitud se refiere a un chat con un negocio, puedes dirigirte al
          negocio responsable. Respondi colaborará con quien corresponda para
          atenderla. También puedes presentar un reclamo ante la
          Superintendencia de Protección de Datos Personales de Ecuador a
          través de los canales oficiales publicados en{" "}
          <a
            href="https://www.spdp.gob.ec"
            className="font-semibold text-brand underline underline-offset-4"
            rel="noopener noreferrer"
            target="_blank"
          >
            spdp.gob.ec
          </a>
          .
        </p>
      </section>
    </article>
  );
}
