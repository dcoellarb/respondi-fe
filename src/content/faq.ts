import { site } from "@/lib/site";

export const faq = [
  {
    question: "¿Respondi guarda mis conversaciones?",
    answer:
      "No. Respondi no guarda en su base de datos los mensajes que llegan ni las respuestas que salen. Procesa el contenido para responder. WhatsApp y los proveedores que intervienen tienen sus propias condiciones de tratamiento, descritas en la Política de privacidad.",
  },
  {
    question: "¿Qué puede responder Respondi?",
    answer:
      "Preguntas frecuentes sobre la información que configures, como horarios, precios o ubicación. Mantén esos datos actualizados para que las respuestas reflejen lo que ofreces.",
  },
  {
    question: "¿En qué idioma funciona?",
    answer:
      "Por ahora, la plataforma y las respuestas automáticas están disponibles en español.",
  },
  {
    question: "¿Cuánto cuesta?",
    answer: `${site.priceLabel}. El precio total, los impuestos aplicables y las condiciones de cobro se confirman antes de pagar.`,
  },
] as const;
