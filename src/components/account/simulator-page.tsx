"use client";

import Link from "next/link";
import { useAccount } from "@/api/hooks";
import { ChatSimulator } from "@/components/account/chat-simulator";
import { buttonClassName } from "@/components/ui/button";
import { accountErrorMessage } from "@/lib/account-messages";
import { ANALYTICS_SURFACES } from "@/lib/analytics-events";

export function SimulatorPage() {
  const account = useAccount();

  if (account.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-page-title">Simulador</h1>
        <p className="text-body text-muted">Cargando…</p>
      </div>
    );
  }

  if (account.isError) {
    return (
      <div className="flex flex-col gap-4">
        <ExitBar />
        <p role="alert" className="form-error text-body font-semibold">
          {accountErrorMessage(account.error)}
        </p>
      </div>
    );
  }

  if (!account.data) {
    return (
      <div className="flex flex-col gap-4">
        <ExitBar />
        <p className="text-body text-muted">
          Primero completa los datos del negocio para probar el chat.
        </p>
        <Link
          href="/cuenta/negocio"
          className={buttonClassName("primary", "w-full sm:w-auto")}
        >
          Ir a datos del negocio
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ExitBar />
      <ChatSimulator
        businessName={account.data.businessName}
        businessPhone={account.data.phone}
        surface={ANALYTICS_SURFACES.PRIVATE_SIMULATOR_PAGE}
      />
    </div>
  );
}

function ExitBar() {
  return (
    <div className="flex items-center justify-between gap-3">
      <h1 className="text-page-title">Simulador</h1>
      <Link
        href="/cuenta"
        className={buttonClassName("secondary", "shrink-0")}
      >
        Salir
      </Link>
    </div>
  );
}
