import { isApiError } from "@/api/errors";
import { captureAnalyticsEvent } from "@/lib/analytics";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_PROPS,
  type AnalyticsSection,
} from "@/lib/analytics-events";

export function trackAccountSectionSaveSuccess(
  section: AnalyticsSection,
  extras?: { itemCount?: number; pagePath?: string },
) {
  captureAnalyticsEvent(ANALYTICS_EVENTS.ACCOUNT_SECTION_SAVE_SUCCESS, {
    [ANALYTICS_PROPS.SECTION]: section,
    [ANALYTICS_PROPS.PAGE_PATH]: extras?.pagePath,
    ...(typeof extras?.itemCount === "number"
      ? { [ANALYTICS_PROPS.ITEM_COUNT]: extras.itemCount }
      : {}),
  });
}

export function trackAccountSectionSaveFailed(
  section: AnalyticsSection,
  error: unknown,
  pagePath?: string,
) {
  captureAnalyticsEvent(ANALYTICS_EVENTS.ACCOUNT_SECTION_SAVE_FAILED, {
    [ANALYTICS_PROPS.SECTION]: section,
    [ANALYTICS_PROPS.PAGE_PATH]: pagePath,
    [ANALYTICS_PROPS.ERROR_CODE]: isApiError(error)
      ? error.code || String(error.status)
      : "unknown",
    [ANALYTICS_PROPS.STATUS]: isApiError(error) ? error.status : undefined,
  });
}
