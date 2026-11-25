"use client";

import { useState } from "react";

/**
 * Independent accordion open state: panels toggle alone and many can stay open.
 * Until the user interacts, `initialOpenId` (if any) is treated as open.
 */
export function useAccordionOpenIds(initialOpenId: string | null) {
  const [openIds, setOpenIds] = useState<Set<string> | null>(null);

  function resolvedIds() {
    if (openIds) return openIds;
    return initialOpenId ? new Set([initialOpenId]) : new Set<string>();
  }

  function isOpen(clientId: string) {
    return resolvedIds().has(clientId);
  }

  function toggleOpen(clientId: string) {
    setOpenIds((current) => {
      const base =
        current ?? (initialOpenId ? new Set([initialOpenId]) : new Set());
      const next = new Set(base);
      if (next.has(clientId)) next.delete(clientId);
      else next.add(clientId);
      return next;
    });
  }

  function openOnly(clientId: string) {
    setOpenIds((current) => {
      const base =
        current ?? (initialOpenId ? new Set([initialOpenId]) : new Set());
      const next = new Set(base);
      next.add(clientId);
      return next;
    });
  }

  function close(clientId: string) {
    setOpenIds((current) => {
      const base =
        current ?? (initialOpenId ? new Set([initialOpenId]) : new Set());
      const next = new Set(base);
      next.delete(clientId);
      return next;
    });
  }

  function replaceOpenIds(clientIds: string[]) {
    setOpenIds(new Set(clientIds));
  }

  return { isOpen, toggleOpen, openOnly, close, replaceOpenIds };
}
