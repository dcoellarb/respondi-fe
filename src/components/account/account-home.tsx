"use client";

import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  useAccount,
  useAddresses,
  useFaqs,
  useProducts,
  useWhatsAppConnection,
} from "@/api/hooks";
import { readAuthSession } from "@/api/session";
import { Button, buttonClassName } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { ChatSimulator } from "@/components/account/chat-simulator";
import { useAnalytics } from "@/hooks/use-analytics";
import { accountErrorMessage } from "@/lib/account-messages";
import { cn } from "@/lib/cn";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_PROPS,
  ANALYTICS_SOURCES,
  ANALYTICS_SURFACES,
  type AnalyticsSection,
} from "@/lib/analytics-events";
import {
  ONBOARDING_SECTIONS,
  areOnboardingDataSectionsReady,
  isOnboardingComplete,
  readSkippedSections,
  sectionStatus,
  skipOnboardingSection,
  subscribeOnboardingSkips,
  type OnboardingPresence,
  type OnboardingSectionId,
  type OnboardingSectionStatus,
} from "@/lib/onboarding";

function useSkippedSections(ownerId: string) {
  return useSyncExternalStore(
    subscribeOnboardingSkips,
    () => readSkippedSections(ownerId),
    () => [] as OnboardingSectionId[],
  );
}

function statusLabel(status: OnboardingSectionStatus) {
  switch (status) {
    case "done":
      return "Completado";
    case "skipped":
      return "Omitido";
    default:
      return "Pendiente";
  }
}

export function AccountHomePage() {
  const session = readAuthSession();
  const ownerId = session?.user?.cognitoId || "local";
  const skipped = useSkippedSections(ownerId);

  const account = useAccount();
  const whatsapp = useWhatsAppConnection({
    enabled: Boolean(account.data),
  });
  const products = useProducts(
    { limit: 50 },
    { enabled: Boolean(account.data) },
  );
  const addresses = useAddresses({ enabled: Boolean(account.data) });
  const faqs = useFaqs({ enabled: Boolean(account.data) });

  const presence = useMemo<OnboardingPresence>(() => {
    const productItems = products.data?.items ?? [];
    const addressItems = addresses.data?.items ?? [];
    const faqItems = faqs.data?.items ?? [];
    const hours = account.data?.hours ?? [];

    return {
      negocio: Boolean(account.data?.businessName?.trim()),
      whatsapp: whatsapp.data?.connected === true,
      productos: productItems.length > 0,
      direcciones:
        addressItems.length > 0 || hours.length > 0,
      preguntas: faqItems.length > 0,
    };
  }, [
    account.data,
    whatsapp.data?.connected,
    products.data?.items,
    addresses.data?.items,
    faqs.data?.items,
  ]);

  const loading =
    account.isLoading ||
    (Boolean(account.data) &&
      (whatsapp.isLoading ||
        products.isLoading ||
        addresses.isLoading ||
        faqs.isLoading));

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-page-title">Tu cuenta</h1>
        <p className="text-body text-muted">Cargando el estado de tu cuenta…</p>
      </div>
    );
  }

  if (account.isError) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-page-title">Tu cuenta</h1>
        <p role="alert" className="form-error text-body font-semibold">
          {accountErrorMessage(account.error)}
        </p>
      </div>
    );
  }

  const complete = isOnboardingComplete(presence, skipped);

  if (!complete) {
    return (
      <OnboardingFlow
        ownerId={ownerId}
        presence={presence}
        skipped={skipped}
        hasProfile={Boolean(account.data)}
      />
    );
  }

  return (
    <CompletedHome
      businessName={account.data?.businessName ?? "Tu negocio"}
      businessPhone={account.data?.phone}
      whatsappPhone={
        whatsapp.data?.connected === true
          ? whatsapp.data.phoneE164
          : null
      }
      productCount={products.data?.items.length ?? 0}
      addressCount={addresses.data?.items.length ?? 0}
      faqCount={faqs.data?.items.length ?? 0}
      scheduleMode={account.data?.scheduleMode}
      hoursCount={account.data?.hours?.length ?? 0}
    />
  );
}

function OnboardingFlow({
  ownerId,
  presence,
  skipped,
  hasProfile,
}: {
  ownerId: string;
  presence: OnboardingPresence;
  skipped: readonly OnboardingSectionId[];
  hasProfile: boolean;
}) {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.capture(ANALYTICS_EVENTS.ACCOUNT_ONBOARDING_VIEW, {
      [ANALYTICS_PROPS.PAGE_PATH]: "/cuenta",
    });
  }, [analytics]);

  const pendingCount = ONBOARDING_SECTIONS.filter(
    (section) => sectionStatus(section.id, presence, skipped) === "pending",
  ).length;
  const showSimulatorPreview = areOnboardingDataSectionsReady(
    presence,
    skipped,
  );

  function trackSectionStart(sectionId: OnboardingSectionId) {
    analytics.capture(ANALYTICS_EVENTS.ACCOUNT_SECTION_START, {
      [ANALYTICS_PROPS.SECTION]: sectionId as AnalyticsSection,
      [ANALYTICS_PROPS.SOURCE]: ANALYTICS_SOURCES.ONBOARDING,
      [ANALYTICS_PROPS.PAGE_PATH]: "/cuenta",
    });
  }

  function trackSectionSkip(sectionId: OnboardingSectionId) {
    analytics.capture(ANALYTICS_EVENTS.ACCOUNT_SECTION_SKIP, {
      [ANALYTICS_PROPS.SECTION]: sectionId as AnalyticsSection,
      [ANALYTICS_PROPS.SOURCE]: ANALYTICS_SOURCES.ONBOARDING,
      [ANALYTICS_PROPS.PAGE_PATH]: "/cuenta",
    });
    skipOnboardingSection(ownerId, sectionId);
  }

  const dataSections = ONBOARDING_SECTIONS.filter(
    (section) => section.id !== "whatsapp",
  );
  const whatsappSection = ONBOARDING_SECTIONS.find(
    (section) => section.id === "whatsapp",
  )!;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-page-title">Configura tu Respondi</h1>
        <p className="text-body text-muted">
          Completa estos pasos para que el agente pueda atender a tus clientes.
          Puedes omitir una sección y volver después.
        </p>
        {!hasProfile ? (
          <Callout>
            Empieza por los datos del negocio. Sin ellos no podremos guardar el
            resto de la información.
          </Callout>
        ) : null}
        <p className="text-meta text-muted">
          {pendingCount === 0
            ? "Ya no quedan pasos pendientes."
            : `${pendingCount} paso${pendingCount === 1 ? "" : "s"} pendiente${pendingCount === 1 ? "" : "s"}.`}
        </p>
      </div>

      <ol className="flex flex-col gap-3">
        {dataSections.map((section, index) => (
          <OnboardingStepCard
            key={section.id}
            section={section}
            stepNumber={index + 1}
            status={sectionStatus(section.id, presence, skipped)}
            locked={
              section.id !== "negocio" &&
              !hasProfile &&
              sectionStatus(section.id, presence, skipped) === "pending"
            }
            onStart={() => trackSectionStart(section.id)}
            onSkip={() => trackSectionSkip(section.id)}
          />
        ))}

        {showSimulatorPreview ? (
          <li className="list-none">
            <SimulatorPreviewCard
              onOpen={() => {
                analytics.capture(ANALYTICS_EVENTS.SIMULATOR_OPEN_CLICK, {
                  [ANALYTICS_PROPS.SURFACE]: ANALYTICS_SURFACES.PRIVATE_HOME,
                  [ANALYTICS_PROPS.SOURCE]: ANALYTICS_SOURCES.ONBOARDING,
                  [ANALYTICS_PROPS.PAGE_PATH]: "/cuenta",
                });
              }}
            />
          </li>
        ) : null}

        <OnboardingStepCard
          section={whatsappSection}
          stepNumber={dataSections.length + 1}
          status={sectionStatus(whatsappSection.id, presence, skipped)}
          locked={
            !hasProfile &&
            sectionStatus(whatsappSection.id, presence, skipped) === "pending"
          }
          onStart={() => trackSectionStart(whatsappSection.id)}
          onSkip={() => trackSectionSkip(whatsappSection.id)}
        />
      </ol>
    </div>
  );
}

function OnboardingStepCard({
  section,
  stepNumber,
  status,
  locked,
  onStart,
  onSkip,
}: {
  section: (typeof ONBOARDING_SECTIONS)[number];
  stepNumber: number;
  status: OnboardingSectionStatus;
  locked: boolean;
  onStart: () => void;
  onSkip: () => void;
}) {
  return (
    <li
      className={cn(
        "rounded-control border border-border bg-surface px-4 py-4",
        status === "done" && "border-brand/30 bg-mint/40",
        status === "skipped" && "border-dashed opacity-80",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-meta font-semibold text-muted">
              Paso {stepNumber}
            </span>
            <StatusBadge status={status} />
          </div>
          <h2 className="text-section text-ink">{section.label}</h2>
          <p className="text-body text-muted">{section.description}</p>
          {locked ? (
            <p className="text-meta text-muted">
              Primero guarda los datos del negocio.
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          {status === "done" ? (
            <Link
              href={section.href}
              className={buttonClassName("secondary", "w-full sm:w-auto")}
            >
              Revisar
            </Link>
          ) : (
            <>
              <Link
                href={section.href}
                aria-disabled={locked}
                className={buttonClassName(
                  "primary",
                  cn(
                    "w-full sm:w-auto",
                    locked && "pointer-events-none opacity-50",
                  ),
                )}
                onClick={(event) => {
                  if (locked) {
                    event.preventDefault();
                    return;
                  }
                  onStart();
                }}
              >
                Completar
              </Link>
              {status === "pending" && !locked ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={onSkip}
                >
                  Omitir
                </Button>
              ) : null}
              {status === "skipped" ? (
                <Link
                  href={section.href}
                  className={buttonClassName("secondary", "w-full sm:w-auto")}
                  onClick={onStart}
                >
                  Completar ahora
                </Link>
              ) : null}
            </>
          )}
        </div>
      </div>
    </li>
  );
}

function SimulatorPreviewCard({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="rounded-control border border-dashed border-brand/40 bg-mint/30 px-4 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-meta font-semibold text-brand">Antes de conectar</p>
          <h2 className="text-section text-ink">Prueba el agente</h2>
          <p className="text-body text-muted">
            Usa el simulador con los datos que ya configuraste. Así puedes
            revisar las respuestas antes de conectar tu número de WhatsApp.
          </p>
        </div>
        <Link
          href="/cuenta/simulador"
          className={buttonClassName("primary", "w-full shrink-0 sm:w-auto")}
          onClick={onOpen}
        >
          Prueba en el simulador
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OnboardingSectionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-meta font-semibold",
        status === "done" && "bg-brand text-white",
        status === "skipped" && "bg-canvas text-muted ring-1 ring-border",
        status === "pending" && "bg-canvas text-ink ring-1 ring-border",
      )}
    >
      {statusLabel(status)}
    </span>
  );
}

function CompletedHome({
  businessName,
  businessPhone,
  whatsappPhone,
  productCount,
  addressCount,
  faqCount,
  scheduleMode,
  hoursCount,
}: {
  businessName: string;
  businessPhone: string | null | undefined;
  whatsappPhone: string | null;
  productCount: number;
  addressCount: number;
  faqCount: number;
  scheduleMode?: "business" | "per_address";
  hoursCount: number;
}) {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.capture(ANALYTICS_EVENTS.ACCOUNT_DASHBOARD_VIEW, {
      [ANALYTICS_PROPS.PAGE_PATH]: "/cuenta",
    });
    analytics.capture(ANALYTICS_EVENTS.ACCOUNT_ONBOARDING_COMPLETE, {
      [ANALYTICS_PROPS.PAGE_PATH]: "/cuenta",
    });
  }, [analytics]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-page-title">{businessName}</h1>
        <p className="text-body text-muted">
          Resumen de tu cuenta
          <span className="hidden lg:inline">
            {" "}
            y una vista previa de cómo responderá el agente
          </span>
          .
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section className="flex flex-col gap-4" aria-labelledby="resumen-titulo">
          <h2 id="resumen-titulo" className="text-section text-ink">
            Resumen
          </h2>

          <ul className="flex flex-col gap-3">
            {ONBOARDING_SECTIONS.map((section) => {
              let detail = "";
              switch (section.id) {
                case "negocio":
                  detail = businessName;
                  break;
                case "whatsapp":
                  detail = whatsappPhone || "Sin conectar";
                  break;
                case "productos":
                  detail =
                    productCount === 0
                      ? "Sin ítems aún"
                      : `${productCount} ítem${productCount === 1 ? "" : "s"}`;
                  break;
                case "direcciones":
                  detail = [
                    addressCount === 0
                      ? "Sin direcciones"
                      : `${addressCount} dirección${addressCount === 1 ? "" : "es"}`,
                    scheduleMode === "per_address"
                      ? "horarios por sucursal"
                      : hoursCount > 0
                        ? `${hoursCount} franja${hoursCount === 1 ? "" : "s"}`
                        : "sin horarios",
                  ].join(" · ");
                  break;
                case "preguntas":
                  detail =
                    faqCount === 0
                      ? "Sin preguntas"
                      : `${faqCount} pregunta${faqCount === 1 ? "" : "s"}`;
                  break;
              }

              return (
                <li
                  key={section.id}
                  className="rounded-control border border-border bg-surface px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex flex-col gap-1">
                      <p className="text-label font-semibold text-ink">
                        {section.label}
                      </p>
                      <p className="text-meta text-muted">{detail}</p>
                    </div>
                    <Link
                      href={section.href}
                      className="shrink-0 text-label font-semibold text-brand underline-offset-2 hover:underline"
                    >
                      Editar
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>

          <Link
            href="/cuenta/simulador"
            className={buttonClassName("primary", "w-full lg:hidden")}
            onClick={() => {
              analytics.capture(ANALYTICS_EVENTS.SIMULATOR_OPEN_CLICK, {
                [ANALYTICS_PROPS.SURFACE]: ANALYTICS_SURFACES.PRIVATE_HOME,
                [ANALYTICS_PROPS.PAGE_PATH]: "/cuenta",
              });
            }}
          >
            Probar simulador de chat
          </Link>
        </section>

        <section
          className="hidden flex-col gap-4 lg:flex"
          aria-labelledby="simulador-titulo"
        >
          <h2 id="simulador-titulo" className="text-section text-ink">
            Simulador de chat
          </h2>
          <ChatSimulator
            businessName={businessName}
            businessPhone={businessPhone}
            surface={ANALYTICS_SURFACES.PRIVATE_HOME}
          />
        </section>
      </div>
    </div>
  );
}
