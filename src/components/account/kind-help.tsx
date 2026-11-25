"use client";

import { useEffect, useId, useRef, useState } from "react";

export function KindHelp() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        className="inline-flex size-6 items-center justify-center rounded-full border border-border bg-surface text-meta font-semibold text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        aria-label="Qué es producto o servicio"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        ?
      </button>
      {open ? (
        <span
          id={panelId}
          role="dialog"
          aria-label="Diferencia entre producto y servicio"
          className="absolute top-8 left-0 z-20 w-[min(18rem,calc(100vw-3rem))] rounded-control border border-border bg-surface px-3 py-3 shadow-float"
        >
          <p className="text-body text-ink">
            Un <strong>producto</strong> es algo físico, como una camiseta, un
            gadget u otro artículo tangible.
          </p>
          <p className="mt-2 text-body text-ink">
            Un <strong>servicio</strong> es algo intangible, como pilates o un
            paquete de megas, y puede tener varios planes con precios
            distintos.
          </p>
        </span>
      ) : null}
    </span>
  );
}
