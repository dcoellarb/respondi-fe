/**
 * Central list of PostHog event names and property values.
 * Add new public/private events here so call sites stay consistent.
 */

export const ANALYTICS_EVENTS = {
  /** Public marketing page view (pathname). */
  PAGE_VIEW: "page_view",

  /** Click on any "Crear mi cuenta" CTA that links to /registro. */
  SIGNUP_CTA_CLICK: "signup_cta_click",

  /** User landed on /registro. */
  SIGNUP_PAGE_VIEW: "signup_page_view",

  /** User clicked the submit button on the signup form (before API result). */
  SIGNUP_SUBMIT_CLICK: "signup_submit_click",

  /** Signup API succeeded. */
  SIGNUP_COMPLETED: "signup_completed",

  /** Signup API failed (funnel drop after submit). */
  SIGNUP_FAILED: "signup_failed",

  /** User landed on /iniciar-sesion. */
  LOGIN_PAGE_VIEW: "login_page_view",

  /** User clicked submit on the login form (before API result). */
  LOGIN_SUBMIT_CLICK: "login_submit_click",

  /** Login API succeeded. */
  LOGIN_COMPLETED: "login_completed",

  /** Login API failed. */
  LOGIN_FAILED: "login_failed",

  /** Click on "Ver cómo funciona" / nav to #como-funciona. */
  HOW_IT_WORKS_CLICK: "how_it_works_click",

  /** #como-funciona section scrolled into view (once per page load). */
  HOW_IT_WORKS_SECTION_VIEW: "how_it_works_section_view",

  /** Private /cuenta home while onboarding checklist is visible. */
  ACCOUNT_ONBOARDING_VIEW: "account_onboarding_view",

  /** Private /cuenta home after onboarding is done (summary + simulator). */
  ACCOUNT_DASHBOARD_VIEW: "account_dashboard_view",

  /** User opened a data section page (negocio / productos / …). */
  ACCOUNT_SECTION_VIEW: "account_section_view",

  /** User clicked Completar / Completar ahora from onboarding. */
  ACCOUNT_SECTION_START: "account_section_start",

  /** User skipped a section from onboarding (stored in localStorage). */
  ACCOUNT_SECTION_SKIP: "account_section_skip",

  /** User successfully saved a data section. */
  ACCOUNT_SECTION_SAVE_SUCCESS: "account_section_save_success",

  /** User tried to save a data section and the API failed. */
  ACCOUNT_SECTION_SAVE_FAILED: "account_section_save_failed",

  /** All onboarding steps are done or skipped. */
  ACCOUNT_ONBOARDING_COMPLETE: "account_onboarding_complete",

  /** Simulator UI became visible (home desktop or /cuenta/simulador). */
  SIMULATOR_VIEW: "simulator_view",

  /** Mobile CTA to open /cuenta/simulador. */
  SIMULATOR_OPEN_CLICK: "simulator_open_click",

  /** User sent a message in the WhatsApp simulator. */
  SIMULATOR_MESSAGE_SENT: "simulator_message_sent",

  /** Simulator returned a draft reply (HTTP 200). */
  SIMULATOR_REPLY_OK: "simulator_reply_ok",

  /** Simulator request failed or skipped (4xx/5xx). */
  SIMULATOR_REPLY_ERROR: "simulator_reply_error",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** Where a signup CTA / how-it-works link was clicked (data-analytics-source). */
export const ANALYTICS_SOURCES = {
  HOME_HERO: "home_hero",
  HOME_PRICING: "home_pricing",
  HOME_FOOTER: "home_footer",
  HEADER_DESKTOP: "header_desktop",
  HEADER_MOBILE: "header_mobile",
  LOGIN_PAGE: "login_page",
  ABOUT_PAGE: "about_page",
  ONBOARDING: "onboarding",
  ACCOUNT_NAV: "account_nav",
} as const;

export type AnalyticsSource =
  (typeof ANALYTICS_SOURCES)[keyof typeof ANALYTICS_SOURCES];

/** Account data sections (align with onboarding ids). */
export const ANALYTICS_SECTIONS = {
  NEGOCIO: "negocio",
  WHATSAPP: "whatsapp",
  PRODUCTOS: "productos",
  DIRECCIONES: "direcciones",
  PREGUNTAS: "preguntas",
} as const;

export type AnalyticsSection =
  (typeof ANALYTICS_SECTIONS)[keyof typeof ANALYTICS_SECTIONS];

/** Which simulator surface sent a message. */
export const ANALYTICS_SURFACES = {
  PUBLIC_HERO: "public_hero",
  PRIVATE_HOME: "private_home",
  PRIVATE_SIMULATOR_PAGE: "private_simulator_page",
} as const;

export type AnalyticsSurface =
  (typeof ANALYTICS_SURFACES)[keyof typeof ANALYTICS_SURFACES];

/** Common property keys — keep payloads lean (no PII / message bodies). */
export const ANALYTICS_PROPS = {
  PAGE_PATH: "page_path",
  SOURCE: "source",
  SURFACE: "surface",
  SECTION: "section",
  ITEM_COUNT: "item_count",
  START_CLEAN: "start_clean",
  SUCCESS: "success",
  ERROR_CODE: "error_code",
  STATUS: "status",
  UTM_SOURCE: "utm_source",
  UTM_MEDIUM: "utm_medium",
  UTM_CAMPAIGN: "utm_campaign",
  UTM_CONTENT: "utm_content",
  UTM_TERM: "utm_term",
  REFERRER_HOST: "referrer_host",
} as const;
