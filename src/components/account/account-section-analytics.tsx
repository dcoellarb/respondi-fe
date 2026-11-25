"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_PROPS,
  type AnalyticsSection,
} from "@/lib/analytics-events";

/** Fires account_section_view once when a private data page mounts. */
export function AccountSectionAnalytics({
  section,
}: {
  section: AnalyticsSection;
}) {
  const pathname = usePathname();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.capture(ANALYTICS_EVENTS.ACCOUNT_SECTION_VIEW, {
      [ANALYTICS_PROPS.SECTION]: section,
      [ANALYTICS_PROPS.PAGE_PATH]: pathname,
    });
  }, [analytics, pathname, section]);

  return null;
}
