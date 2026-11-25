"use client";

import { useCallback, useMemo } from "react";
import {
  canUsePostHog,
  captureAnalyticsEvent,
  captureAnalyticsException,
  isProductionAnalytics,
  type AnalyticsProperties,
} from "@/lib/analytics";
import type { AnalyticsEventName } from "@/lib/analytics-events";

/**
 * Single entry point for client analytics.
 * Validates production + PostHog config before any capture.
 */
export function useAnalytics() {
  const enabled = canUsePostHog();

  const capture = useCallback(
    (event: AnalyticsEventName | string, properties?: AnalyticsProperties) => {
      captureAnalyticsEvent(event, properties);
    },
    [],
  );

  const captureException = useCallback((error: unknown) => {
    captureAnalyticsException(error);
  }, []);

  return useMemo(
    () => ({
      enabled,
      isProduction: isProductionAnalytics(),
      capture,
      captureException,
    }),
    [enabled, capture, captureException],
  );
}
