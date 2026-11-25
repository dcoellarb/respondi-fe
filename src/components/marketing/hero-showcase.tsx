"use client";

import Image from "next/image";
import { ChatSimulator } from "@/components/account/chat-simulator";
import { ANALYTICS_SURFACES } from "@/lib/analytics-events";

/** Demo gym account wired to the public WhatsApp simulation webhook. */
const DEMO_BUSINESS_NAME = "CircuitFit";
const DEMO_BUSINESS_PHONE = "+593980000000";

export function HeroShowcase() {
  return (
    <div className="relative w-full md:min-h-[36rem]">
      {/* Mobile: full-screen simulator (no gym photo behind) */}
      <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-4 py-4 md:hidden">
        <div className="w-full max-w-md px-1 text-center">
          <p className="text-[clamp(1.75rem,7vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.05em] text-ink">
            Prueba nuestro simulador
          </p>
          <p className="mt-1 text-body text-muted">
            Escribe abajo como un cliente · {DEMO_BUSINESS_NAME}
          </p>
        </div>
        <ChatSimulator
          variant="demo"
          surface={ANALYTICS_SURFACES.PUBLIC_HERO}
          businessName={DEMO_BUSINESS_NAME}
          businessPhone={DEMO_BUSINESS_PHONE}
          className="flex h-full max-h-[100dvh] w-full max-w-md flex-1 flex-col"
          phoneClassName="h-full min-h-[calc(100dvh-9rem)] max-h-[calc(100dvh-9rem)] w-full border-[8px]"
          showFooterHint={false}
        />
      </div>

      {/* Desktop: title centered over the full image, phone overlays the photo */}
      <div className="hidden md:block">
        <p className="mb-8 whitespace-nowrap text-center text-[clamp(1.625rem,2.8vw,2.375rem)] font-extrabold leading-none tracking-[-0.05em] text-ink">
          Prueba nuestro simulador
        </p>
        <div className="relative">
          <Image
            src="/images/respondi/hero-gimnasio.webp"
            alt="Entrenadora conversando con una clienta en un gimnasio"
            width={1122}
            height={1402}
            priority
            sizes="(max-width: 1240px) 46vw, 560px"
            className="aspect-[1/1.04] w-full rounded-media object-cover object-[center_38%]"
          />
          <div className="pointer-events-none absolute inset-0">
            <div className="pointer-events-auto absolute top-1/2 right-0 w-[min(440px,60%)] -translate-y-1/2 translate-x-[-4%] lg:right-3 lg:w-[min(460px,64%)] lg:translate-x-0">
              <ChatSimulator
                variant="demo"
                surface={ANALYTICS_SURFACES.PUBLIC_HERO}
                businessName={DEMO_BUSINESS_NAME}
                businessPhone={DEMO_BUSINESS_PHONE}
                className="max-w-none"
                phoneClassName="h-[min(34rem,64vh)] w-full border-[8px]"
                showFooterHint={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
