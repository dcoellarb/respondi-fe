"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button-link";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";
import { cn } from "@/lib/cn";

const sectionLinks = [
  {
    href: "/#como-funciona",
    label: "Cómo funciona",
    analyticsEvent: ANALYTICS_EVENTS.HOW_IT_WORKS_CLICK,
  },
  { href: "/#precio", label: "Precio" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;

    firstLinkRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function closeAfterNavigation() {
    window.setTimeout(() => setOpen(false), 0);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex min-h-[76px] w-full max-w-site items-center gap-3 px-4 md:gap-6 md:px-12">
        <Link
          href="/"
          aria-label="Respondi, inicio"
          className="shrink-0 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          onClick={() => setOpen(false)}
        >
          <Logo alt="" height={28} className="md:hidden" priority />
          <Logo alt="" height={32} className="hidden md:block" priority />
        </Link>

        <nav
          aria-label="Principal"
          className="ml-auto hidden items-center gap-6 lg:flex"
        >
          {sectionLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              {...("analyticsEvent" in link
                ? {
                    "data-analytics-event": link.analyticsEvent,
                    "data-analytics-source": ANALYTICS_SOURCES.HEADER_DESKTOP,
                  }
                : {})}
              className="rounded-control text-label font-bold text-ink hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/iniciar-sesion"
            className="rounded-control text-label font-bold text-ink hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Iniciar sesión
          </Link>
          <ButtonLink
            href="/registro"
            data-analytics-event={ANALYTICS_EVENTS.SIGNUP_CTA_CLICK}
            data-analytics-source={ANALYTICS_SOURCES.HEADER_DESKTOP}
            className="min-h-12 gap-3 px-[18px] font-bold"
          >
            Crear mi cuenta
          </ButtonLink>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <ButtonLink
            href="/registro"
            data-analytics-event={ANALYTICS_EVENTS.SIGNUP_CTA_CLICK}
            data-analytics-source={ANALYTICS_SOURCES.HEADER_MOBILE}
            className="min-h-11 px-3 font-bold sm:min-h-12 sm:px-[18px]"
            onClick={() => setOpen(false)}
          >
            Crear mi cuenta
          </ButtonLink>
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-control text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      <nav
        id={panelId}
        aria-label="Principal"
        hidden={!open}
        className={cn(
          "border-t border-border bg-canvas lg:hidden",
          !open && "hidden",
        )}
      >
        <ul className="mx-auto flex w-full max-w-site flex-col px-4 py-2 md:px-12">
          {sectionLinks.map((link, index) => (
            <li key={link.href}>
              <Link
                ref={index === 0 ? firstLinkRef : undefined}
                href={link.href}
                {...("analyticsEvent" in link
                  ? {
                      "data-analytics-event": link.analyticsEvent,
                      "data-analytics-source": ANALYTICS_SOURCES.HEADER_MOBILE,
                    }
                  : {})}
                className="flex min-h-11 items-center rounded-control text-label font-bold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                onClick={closeAfterNavigation}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/iniciar-sesion"
              className="flex min-h-11 items-center rounded-control text-label font-bold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              onClick={closeAfterNavigation}
            >
              Iniciar sesión
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}
