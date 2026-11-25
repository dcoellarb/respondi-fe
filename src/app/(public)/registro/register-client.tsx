"use client";

import { useEffect } from "react";
import { RegisterForm } from "@/components/account/auth-forms";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { TextLink } from "@/components/marketing/text-link";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_PROPS,
} from "@/lib/analytics-events";

export function RegisterClient() {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.capture(ANALYTICS_EVENTS.SIGNUP_PAGE_VIEW, {
      [ANALYTICS_PROPS.PAGE_PATH]: "/registro",
    });
  }, [analytics]);

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-6">
      <Breadcrumbs items={[{ name: "Crear mi cuenta", path: "/registro" }]} />
      <h1 className="text-page-title">Crear mi cuenta</h1>
      <p className="text-body text-ink">
        Aviso de privacidad. Respondi usa tu nombre, apellido y correo para
        crear y administrar la cuenta. En este paso no pedimos la configuración
        del negocio ni mensajes de WhatsApp. El detalle está en la{" "}
        <TextLink href="/privacidad">Política de privacidad</TextLink>. Crear
        la cuenta no contrata el plan ni genera un cobro.
      </p>
      <p className="text-body text-ink">
        Lee los <TextLink href="/terminos">Términos y condiciones</TextLink> y
        la <TextLink href="/privacidad">Política de privacidad</TextLink> antes
        de continuar.
      </p>
      <RegisterForm />
      <p className="text-body text-muted">
        ¿Ya tienes cuenta?{" "}
        <TextLink href="/iniciar-sesion">Iniciar sesión</TextLink>
      </p>
    </article>
  );
}
