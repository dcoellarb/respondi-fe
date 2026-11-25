import posthog from "posthog-js";
import { canUsePostHog, isProductionAnalytics } from "@/lib/analytics";

/**
 * PostHog boots only in production. Dev / staging / preview never init,
 * so autocapture and exception capture stay off outside prod.
 */
if (canUsePostHog()) {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST!;

  posthog.init(token, {
    api_host: host,
    defaults: "2026-08-30",
    // We send our own page_view with UTM/referrer props.
    capture_pageview: false,
    capture_pageleave: true,
    capture_exceptions: true,
    debug: false,
  });
} else if (
  process.env.NODE_ENV === "development" &&
  isProductionAnalytics() === false
) {
  // Quiet in non-prod: missing tokens are expected locally and on staging.
}
