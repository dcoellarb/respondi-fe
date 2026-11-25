"use client";

import { useEffect } from "react";
import { LoginForm } from "@/components/account/auth-forms";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { TextLink } from "@/components/marketing/text-link";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_PROPS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";

export function LoginClient() {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.capture(ANALYTICS_EVENTS.LOGIN_PAGE_VIEW, {
      [ANALYTICS_PROPS.PAGE_PATH]: "/iniciar-sesion",
    });
  }, [analytics]);

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-6">
      <Breadcrumbs items={[{ name: "Iniciar sesión", path: "/iniciar-sesion" }]} />
      <h1 className="text-page-title">Iniciar sesión</h1>
      <p className="text-body text-ink">
        Entra con la cuenta que ya creaste. La configuración del negocio y la
        conexión de WhatsApp están en el área privada.
      </p>
      <LoginForm />
      <p className="text-body text-muted">
        ¿Aún no tienes cuenta?{" "}
        <TextLink
          href="/registro"
          data-analytics-event={ANALYTICS_EVENTS.SIGNUP_CTA_CLICK}
          data-analytics-source={ANALYTICS_SOURCES.LOGIN_PAGE}
        >
          Crear mi cuenta
        </TextLink>
      </p>
    </article>
  );
}
