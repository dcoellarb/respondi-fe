"use client";

import Link from "next/link";
import { useState } from "react";
import {
  useAccount,
  useConnectWhatsApp,
  useDisconnectWhatsApp,
  useWhatsAppConnection,
} from "@/api/hooks";
import { AccountSectionAnalytics } from "@/components/account/account-section-analytics";
import { accountNav } from "@/components/account/account-nav";
import { Button, buttonClassName } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { TextField } from "@/components/ui/text-field";
import { accountErrorMessage } from "@/lib/account-messages";
import { ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import {
  EmbeddedSignupError,
  isMetaEmbeddedSignupConfigured,
  launchWhatsAppEmbeddedSignup,
} from "@/lib/meta-embedded-signup";
import type { WhatsAppConnection } from "@/api/types";

const whatsappNav = accountNav.find(
  (item) => item.href === "/cuenta/whatsapp",
)!;

type PendingCloudApiConnect = {
  code: string;
  wabaId: string;
  phoneNumberId: string;
};

function formatConnectedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function connectFlowErrorMessage(error: unknown) {
  if (error instanceof EmbeddedSignupError) {
    return error.message;
  }
  return accountErrorMessage(error);
}

export function WhatsAppConnectPage() {
  const account = useAccount();
  const hasProfile = Boolean(account.data);
  const whatsapp = useWhatsAppConnection({
    enabled: hasProfile,
  });
  const connect = useConnectWhatsApp();
  const disconnect = useDisconnectWhatsApp();

  const [pin, setPin] = useState("");
  const [pendingCloudApi, setPendingCloudApi] =
    useState<PendingCloudApiConnect | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const metaReady = isMetaEmbeddedSignupConfigured();
  const connected =
    whatsapp.data?.connected === true ? whatsapp.data : null;

  async function onConnect() {
    setFormError(null);
    setPendingCloudApi(null);
    setPin("");

    if (!hasProfile) {
      setFormError(
        "Primero completa y guarda los datos del negocio.",
      );
      return;
    }
    if (!metaReady) {
      setFormError(
        "Falta configurar Meta Embedded Signup en este entorno.",
      );
      return;
    }

    setBusy(true);
    try {
      const { code, session } = await launchWhatsAppEmbeddedSignup();

      if (session.coexistence) {
        await connect.mutateAsync({
          code,
          wabaId: session.wabaId,
          phoneNumberId: session.phoneNumberId,
          skipRegister: true,
        });
        return;
      }

      // API-only / new Cloud API number: need two-step PIN before register.
      setPendingCloudApi({
        code,
        wabaId: session.wabaId,
        phoneNumberId: session.phoneNumberId,
      });
    } catch (error) {
      setFormError(connectFlowErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onCompleteWithPin() {
    setFormError(null);
    if (!pendingCloudApi) return;

    if (!/^\d{6}$/.test(pin)) {
      setFormError(
        "Escribe el PIN de 6 dígitos de verificación en dos pasos de WhatsApp.",
      );
      return;
    }

    setBusy(true);
    try {
      await connect.mutateAsync({
        code: pendingCloudApi.code,
        wabaId: pendingCloudApi.wabaId,
        phoneNumberId: pendingCloudApi.phoneNumberId,
        pin,
        skipRegister: false,
      });
      setPendingCloudApi(null);
      setPin("");
    } catch (error) {
      setFormError(connectFlowErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onDisconnect() {
    setFormError(null);
    setBusy(true);
    try {
      await disconnect.mutateAsync();
    } catch (error) {
      setFormError(accountErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (account.isLoading || (hasProfile && whatsapp.isLoading)) {
    return (
      <div className="flex flex-col gap-4">
        <AccountSectionAnalytics section={ANALYTICS_SECTIONS.WHATSAPP} />
        <h1 className="text-page-title">{whatsappNav.label}</h1>
        <p className="text-body text-muted">Cargando estado de WhatsApp…</p>
      </div>
    );
  }

  if (account.isError) {
    return (
      <div className="flex flex-col gap-4">
        <AccountSectionAnalytics section={ANALYTICS_SECTIONS.WHATSAPP} />
        <h1 className="text-page-title">{whatsappNav.label}</h1>
        <p role="alert" className="form-error text-body font-semibold">
          {accountErrorMessage(account.error)}
        </p>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="flex flex-col gap-4">
        <AccountSectionAnalytics section={ANALYTICS_SECTIONS.WHATSAPP} />
        <h1 className="text-page-title">{whatsappNav.label}</h1>
        <Callout>
          Primero completa y guarda los datos del negocio. Después podrás
          conectar WhatsApp con Meta.
        </Callout>
        <Link
          href="/cuenta/negocio"
          className={buttonClassName("primary", "w-full sm:w-auto")}
        >
          Ir a datos del negocio
        </Link>
      </div>
    );
  }

  if (whatsapp.isError) {
    return (
      <div className="flex flex-col gap-4">
        <AccountSectionAnalytics section={ANALYTICS_SECTIONS.WHATSAPP} />
        <h1 className="text-page-title">{whatsappNav.label}</h1>
        <p role="alert" className="form-error text-body font-semibold">
          {accountErrorMessage(whatsapp.error)}
        </p>
        <Button type="button" onClick={() => void whatsapp.refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AccountSectionAnalytics section={ANALYTICS_SECTIONS.WHATSAPP} />
      <header className="flex flex-col gap-2">
        <h1 className="text-page-title">{whatsappNav.label}</h1>
        <p className="max-w-xl text-body text-muted">
          {whatsappNav.description}
        </p>
      </header>

      {formError ? (
        <p
          role="alert"
          className="form-error rounded-control border border-[#f5c2c0] bg-[#fef3f2] px-3 py-2 text-label font-semibold"
        >
          {formError}
        </p>
      ) : null}

      {connected ? (
        <ConnectedPanel
          connection={connected}
          busy={busy || disconnect.isPending}
          onDisconnect={() => void onDisconnect()}
        />
      ) : (
        <DisconnectedPanel
          pin={pin}
          pendingCloudApi={pendingCloudApi}
          busy={busy || connect.isPending}
          metaReady={metaReady}
          onPinChange={setPin}
          onConnect={() => void onConnect()}
          onCompleteWithPin={() => void onCompleteWithPin()}
          onCancelPending={() => {
            setPendingCloudApi(null);
            setPin("");
            setFormError(null);
          }}
        />
      )}
    </div>
  );
}

function DisconnectedPanel({
  pin,
  pendingCloudApi,
  busy,
  metaReady,
  onPinChange,
  onConnect,
  onCompleteWithPin,
  onCancelPending,
}: {
  pin: string;
  pendingCloudApi: PendingCloudApiConnect | null;
  busy: boolean;
  metaReady: boolean;
  onPinChange: (value: string) => void;
  onConnect: () => void;
  onCompleteWithPin: () => void;
  onCancelPending: () => void;
}) {
  if (pendingCloudApi) {
    return (
      <div className="flex max-w-xl flex-col gap-5">
        <Callout>
          Meta autorizó un número nuevo (solo Cloud API). Para completar el
          registro escribe el PIN de verificación en dos pasos de WhatsApp
          Manager. El código de Meta caduca en ~30 segundos: no esperes.
        </Callout>

        <TextField
          label="PIN de verificación en dos pasos (6 dígitos)"
          name="whatsapp-pin"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={pin}
          disabled={busy}
          onChange={(event) =>
            onPinChange(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          hint="Es el PIN que configuraste en WhatsApp Manager para este número."
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={onCompleteWithPin}
          >
            {busy ? "Completando…" : "Completar conexión"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={onCancelPending}
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <Callout>
        Puedes seguir usando la app WhatsApp Business en tu teléfono. Respondi
        también enviará y recibirá mensajes automáticos en ese mismo número.
        Se abrirá una ventana de Meta para autorizar: termínala sin pausas
        largas (el código caduca en ~30 segundos).
      </Callout>

      <ol className="flex list-decimal flex-col gap-2 pl-5 text-body text-muted">
        <li>Inicia sesión en Facebook con la cuenta del negocio.</li>
        <li>Elige el número que ya usas en WhatsApp Business.</li>
        <li>Confirma la autorización para Respondi.</li>
      </ol>

      {!metaReady ? (
        <p role="alert" className="form-error text-label font-semibold">
          Este entorno no tiene configurado Meta Embedded Signup
          (`NEXT_PUBLIC_META_APP_ID` y
          `NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID`).
        </p>
      ) : null}

      <Button
        type="button"
        className="w-full sm:w-auto"
        disabled={busy || !metaReady}
        onClick={onConnect}
      >
        {busy ? "Conectando…" : "Conectar WhatsApp"}
      </Button>
    </div>
  );
}

function ConnectedPanel({
  connection,
  busy,
  onDisconnect,
}: {
  connection: WhatsAppConnection;
  busy: boolean;
  onDisconnect: () => void;
}) {
  return (
    <div className="flex max-w-xl flex-col gap-5">
      <div className="rounded-control border border-brand/30 bg-mint/40 px-4 py-4">
        <p className="text-label font-semibold text-brand">Conectado</p>
        <p className="mt-2 text-section text-ink">{connection.phoneE164}</p>
        <dl className="mt-4 grid gap-2 text-meta text-muted">
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-semibold text-ink">Conectado el</dt>
            <dd>{formatConnectedAt(connection.connectedAt)}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-semibold text-ink">Actualizado</dt>
            <dd>{formatConnectedAt(connection.updatedAt)}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-semibold text-ink">WABA</dt>
            <dd className="font-mono text-[12px]">{connection.wabaId}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-semibold text-ink">Phone number ID</dt>
            <dd className="font-mono text-[12px]">
              {connection.phoneNumberId}
            </dd>
          </div>
        </dl>
      </div>

      <Callout>
        Respondi usa esta conexión para recibir y responder mensajes. Desconectar
        no borra el número en Meta; solo deja de usar el token en Respondi.
      </Callout>

      <Button
        type="button"
        variant="secondary"
        className="w-full sm:w-auto"
        disabled={busy}
        onClick={onDisconnect}
      >
        {busy ? "Desconectando…" : "Desconectar WhatsApp"}
      </Button>
    </div>
  );
}
