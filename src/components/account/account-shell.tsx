"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useSignOut } from "@/api/hooks";
import {
  readAuthSession,
  subscribeAuthSession,
} from "@/api/session";
import { accountHomeNav, accountNav } from "@/components/account/account-nav";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

function subscribeIsClient(onStoreChange: () => void) {
  queueMicrotask(onStoreChange);
  return () => {};
}

export function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const signOut = useSignOut();
  const isClient = useSyncExternalStore(
    subscribeIsClient,
    () => true,
    () => false,
  );
  const session = useSyncExternalStore(
    subscribeAuthSession,
    readAuthSession,
    () => null,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const panelId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!isClient) return;
    if (!readAuthSession()) {
      window.location.replace("/iniciar-sesion");
    }
  }, [isClient]);

  useEffect(() => {
    if (!menuOpen) return;

    firstLinkRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  function closeMenuAfterNavigation() {
    window.setTimeout(() => setMenuOpen(false), 0);
  }

  async function onSignOut() {
    try {
      await signOut.mutateAsync();
    } catch {
      // Local session is cleared in signOut even if the request fails.
    }
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- auth handoff
    window.location.assign("/iniciar-sesion");
  }

  if (!isClient || !session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas px-4">
        <p className="text-body text-muted">Cargando tu cuenta…</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-canvas md:flex">
      <a
        href="#contenido-cuenta"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-3 focus:text-label focus:ring-2 focus:ring-brand"
      >
        Saltar al contenido
      </a>

      <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 md:hidden">
        <Link
          href="/cuenta"
          aria-label="Respondi, área de la cuenta"
          className="rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Logo alt="" height={28} />
        </Link>
        <button
          ref={menuButtonRef}
          type="button"
          className="ml-auto inline-flex size-11 items-center justify-center rounded-control text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-expanded={menuOpen}
          aria-controls={panelId}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span className="sr-only">
            {menuOpen ? "Cerrar menú" : "Abrir menú"}
          </span>
          <MenuIcon open={menuOpen} />
        </button>
      </header>

      <aside
        id={panelId}
        className={cn(
          "border-b border-border bg-surface md:flex md:min-h-dvh md:w-72 md:shrink-0 md:flex-col md:border-r md:border-b-0",
          menuOpen ? "block" : "hidden md:flex",
        )}
      >
        <div className="hidden items-center px-6 py-5 md:flex">
          <Link
            href="/cuenta"
            aria-label="Respondi, área de la cuenta"
            className="rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Logo alt="" height={32} />
          </Link>
        </div>

        <nav
          aria-label="Cuenta"
          className="flex flex-1 flex-col px-3 py-3 md:px-4"
        >
          <ul className="flex flex-col gap-1 pb-3">
            <li>
              <Link
                ref={firstLinkRef}
                href={accountHomeNav.href}
                aria-current={
                  pathname === "/cuenta" || pathname === "/cuenta/"
                    ? "page"
                    : undefined
                }
                onClick={closeMenuAfterNavigation}
                className={cn(
                  "flex min-h-11 items-center rounded-control px-3 text-label font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  pathname === "/cuenta" || pathname === "/cuenta/"
                    ? "bg-mint text-ink"
                    : "text-ink hover:bg-canvas",
                )}
              >
                {accountHomeNav.label}
              </Link>
            </li>
          </ul>
          <p className="px-3 pb-2 text-meta font-medium text-muted">
            Configuración
          </p>
          <ul className="flex flex-col gap-1">
            {accountNav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={closeMenuAfterNavigation}
                    className={cn(
                      "flex min-h-11 items-center rounded-control px-3 text-label font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                      active
                        ? "bg-mint text-ink"
                        : "text-ink hover:bg-canvas",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto border-t border-border px-3 pt-4 pb-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => void onSignOut()}
              disabled={signOut.isPending}
            >
              {signOut.isPending ? "Cerrando sesión…" : "Cerrar sesión"}
            </Button>
          </div>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div
          id="contenido-cuenta"
          className={cn(
            "mx-auto w-full flex-1 px-4 py-6 md:px-8 md:py-8",
            pathname === "/cuenta" ||
              pathname === "/cuenta/" ||
              pathname.startsWith("/cuenta/simulador")
              ? "max-w-6xl"
              : "max-w-3xl",
          )}
        >
          {children}
        </div>
      </div>
    </div>
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
