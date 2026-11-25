"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAnalytics } from "@/hooks/use-analytics";
import { attributionProperties } from "@/lib/analytics";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_PROPS,
} from "@/lib/analytics-events";

/**
 * Delegated clicks: any element with
 *   data-analytics-event="signup_cta_click"
 *   data-analytics-source="home_hero"
 */
export function PublicAnalytics() {
  const pathname = usePathname();
  const analytics = useAnalytics();
  const howItWorksSeen = useRef(false);

  useEffect(() => {
    analytics.capture(ANALYTICS_EVENTS.PAGE_VIEW, {
      [ANALYTICS_PROPS.PAGE_PATH]: pathname,
      ...attributionProperties(),
    });
  }, [analytics, pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const cta = target.closest<HTMLElement>("[data-analytics-event]");
      if (!cta) return;

      const eventName = cta.dataset.analyticsEvent;
      if (!eventName) return;

      const source = cta.dataset.analyticsSource;
      analytics.capture(eventName, {
        [ANALYTICS_PROPS.PAGE_PATH]: pathname,
        ...(source ? { [ANALYTICS_PROPS.SOURCE]: source } : {}),
        ...attributionProperties(),
      });
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [analytics, pathname]);

  useEffect(() => {
    if (pathname !== "/") {
      howItWorksSeen.current = false;
      return;
    }

    const section = document.getElementById("como-funciona");
    if (!section || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.35,
        );
        if (!visible || howItWorksSeen.current) return;
        howItWorksSeen.current = true;
        analytics.capture(ANALYTICS_EVENTS.HOW_IT_WORKS_SECTION_VIEW, {
          [ANALYTICS_PROPS.PAGE_PATH]: pathname,
        });
      },
      { threshold: [0.35] },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [analytics, pathname]);

  return null;
}
