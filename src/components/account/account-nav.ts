export const accountHomeNav = {
  href: "/cuenta",
  label: "Inicio",
  description: "Resumen de tu cuenta y avance de configuración.",
} as const;

export const accountNav = [
  {
    href: "/cuenta/negocio",
    label: "Datos del negocio",
    description: "Nombre, contacto y datos básicos de tu cuenta.",
  },
  {
    href: "/cuenta/productos",
    label: "Productos y servicios",
    description: "Catálogo de lo que ofreces a tus clientes.",
  },
  {
    href: "/cuenta/direcciones",
    label: "Direcciones y horarios",
    description: "Sucursales, ubicaciones y horarios de atención.",
  },
  {
    href: "/cuenta/preguntas",
    label: "Preguntas frecuentes",
    description: "Respuestas automáticas a consultas repetidas.",
  },
  {
    href: "/cuenta/whatsapp",
    label: "WhatsApp",
    description: "Conecta el WhatsApp Business de tu negocio con Meta.",
  },
] as const;

export type AccountNavItem = (typeof accountNav)[number];
