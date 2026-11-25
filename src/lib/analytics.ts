import posthog from "posthog-js";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_PROPS,
  type AnalyticsEventName,
} from "@/lib/analytics-events";

/**
 * Analytics (PostHog) runs only on the production deployment.
 * Local, preview, and staging must never init or send events.
 *
 * Uses NEXT_PUBLIC_VERCEL_ENV so the check is available in the browser bundle
 * (inlined at build time; set only in .env.production / `pnpm deploy`).
 * - production → enabled
 * - preview / development / staging / unset → disabled
 */
export function isProductionAnalytics(): boolean {
  return process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
}

export function isPostHogConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
      process.env.NEXT_PUBLIC_POSTHOG_HOST,
  );
}

/** True only when we should talk to PostHog at all. */
export function canUsePostHog(): boolean {
  return isProductionAnalytics() && isPostHogConfigured();
}

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

/** Attribution fields from the current URL + document.referrer (no full referrer URL). */
export function attributionProperties(): AnalyticsProperties {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const props: AnalyticsProperties = {};

  for (const key of [
    ANALYTICS_PROPS.UTM_SOURCE,
    ANALYTICS_PROPS.UTM_MEDIUM,
    ANALYTICS_PROPS.UTM_CAMPAIGN,
    ANALYTICS_PROPS.UTM_CONTENT,
    ANALYTICS_PROPS.UTM_TERM,
  ] as const) {
    const value = params.get(key);
    if (value) props[key] = value;
  }

  try {
    if (document.referrer) {
      props[ANALYTICS_PROPS.REFERRER_HOST] = new URL(document.referrer).hostname;
    }
  } catch {
    // ignore invalid referrer
  }

  return props;
}

/**
 * Capture a PostHog event. No-ops outside production or when PostHog is unset.
 * Prefer `useAnalytics().capture` from React components.
 */
export function captureAnalyticsEvent(
  event: AnalyticsEventName | string,
  properties?: AnalyticsProperties,
) {
  if (!canUsePostHog()) return;
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}

export function captureAnalyticsException(error: unknown) {
  if (!canUsePostHog()) return;
  if (typeof window === "undefined") return;
  posthog.captureException(error);
}

/** @deprecated Prefer captureAnalyticsEvent(ANALYTICS_EVENTS.*, …) */
export function track(event: string, path: string) {
  captureAnalyticsEvent(event, { [ANALYTICS_PROPS.PAGE_PATH]: path });
}

export { ANALYTICS_EVENTS, ANALYTICS_PROPS };
