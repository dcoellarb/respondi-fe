/**
 * Meta WhatsApp Embedded Signup (Facebook Login for Business, v4+).
 * Token exchange and Graph register/subscribe stay on the backend.
 */

export type EmbeddedSignupSession = {
  wabaId: string;
  phoneNumberId: string;
  /** True when the number stays on WhatsApp Business app (coexistence). */
  coexistence: boolean;
};

export type EmbeddedSignupResult = {
  code: string;
  session: EmbeddedSignupSession;
};

type WaEmbeddedSignupMessage = {
  type?: string;
  event?: string;
  data?: {
    waba_id?: string;
    phone_number_id?: string;
    current_step?: string;
    error_message?: string;
  };
};

type FbAuthResponse = {
  code?: string;
};

type FbLoginResponse = {
  authResponse?: FbAuthResponse | null;
  status?: string;
};

type FbSdk = {
  init: (params: {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
  }) => void;
  login: (
    callback: (response: FbLoginResponse) => void,
    options: Record<string, unknown>,
  ) => void;
};

declare global {
  interface Window {
    FB?: FbSdk;
    fbAsyncInit?: () => void;
  }
}

const FB_SDK_SRC = "https://connect.facebook.net/en_US/sdk.js";
const GRAPH_VERSION = "v22.0";

let sdkPromise: Promise<FbSdk> | null = null;

export function getMetaAppId() {
  return process.env.NEXT_PUBLIC_META_APP_ID?.trim() || "";
}

export function getMetaEmbeddedSignupConfigId() {
  return (
    process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID?.trim() || ""
  );
}

export function isMetaEmbeddedSignupConfigured() {
  return Boolean(getMetaAppId() && getMetaEmbeddedSignupConfigId());
}

function loadFacebookSdk(appId: string): Promise<FbSdk> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Facebook SDK requires a browser."));
  }
  if (window.FB) return Promise.resolve(window.FB);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const previous = window.fbAsyncInit;
    window.fbAsyncInit = () => {
      try {
        previous?.();
        window.FB?.init({
          appId,
          cookie: true,
          xfbml: false,
          version: GRAPH_VERSION,
        });
        if (!window.FB) {
          reject(new Error("Facebook SDK failed to initialize."));
          return;
        }
        resolve(window.FB);
      } catch (error) {
        reject(error);
      }
    };

    if (document.getElementById("facebook-jssdk")) return;

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = FB_SDK_SRC;
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("No se pudo cargar el SDK de Facebook."));
    };
    document.body.appendChild(script);
  });

  return sdkPromise;
}

function isFacebookOrigin(origin: string) {
  try {
    const host = new URL(origin).hostname;
    return host === "facebook.com" || host.endsWith(".facebook.com");
  } catch {
    return false;
  }
}

function parseSessionMessage(
  event: MessageEvent,
): WaEmbeddedSignupMessage | null {
  if (!isFacebookOrigin(event.origin)) return null;
  const raw = event.data;
  if (typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw) as WaEmbeddedSignupMessage;
    if (parsed?.type !== "WA_EMBEDDED_SIGNUP") return null;
    return parsed;
  } catch {
    return null;
  }
}

export class EmbeddedSignupError extends Error {
  readonly code:
    | "cancelled"
    | "missing_session"
    | "missing_code"
    | "misconfigured"
    | "sdk";

  constructor(
    code: EmbeddedSignupError["code"],
    message: string,
  ) {
    super(message);
    this.name = "EmbeddedSignupError";
    this.code = code;
  }
}

/**
 * Opens Meta Embedded Signup. Resolves when both the session message
 * (waba/phone ids) and FB.login code are available.
 */
export async function launchWhatsAppEmbeddedSignup(): Promise<EmbeddedSignupResult> {
  const appId = getMetaAppId();
  const configId = getMetaEmbeddedSignupConfigId();
  if (!appId || !configId) {
    throw new EmbeddedSignupError(
      "misconfigured",
      "Falta configurar Meta App ID o el ID de Embedded Signup.",
    );
  }

  const FB = await loadFacebookSdk(appId);

  let session: EmbeddedSignupSession | null = null;
  let sessionError: string | null = null;

  const onMessage = (event: MessageEvent) => {
    const payload = parseSessionMessage(event);
    if (!payload) return;

    if (
      payload.event === "FINISH" ||
      payload.event === "FINISH_ONLY_WABA" ||
      payload.event === "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING"
    ) {
      const wabaId = payload.data?.waba_id?.trim() || "";
      const phoneNumberId = payload.data?.phone_number_id?.trim() || "";
      if (wabaId && phoneNumberId) {
        session = {
          wabaId,
          phoneNumberId,
          coexistence:
            payload.event === "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING",
        };
      } else if (payload.event === "FINISH_ONLY_WABA") {
        sessionError =
          "El flujo terminó sin un número de WhatsApp. Vuelve a intentarlo y elige un número.";
      }
    } else if (payload.event === "CANCEL") {
      sessionError =
        payload.data?.error_message ||
        "Cancelaste la conexión de WhatsApp.";
    } else if (payload.event === "ERROR") {
      sessionError =
        payload.data?.error_message ||
        "Meta reportó un error en el registro de WhatsApp.";
    }
  };

  window.addEventListener("message", onMessage);

  try {
    const loginResponse = await new Promise<FbLoginResponse>((resolve) => {
      FB.login((response) => resolve(response), {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "whatsapp_business_app_onboarding",
          sessionInfoVersion: "3",
        },
      });
    });

    const code = loginResponse.authResponse?.code?.trim() || "";
    if (!code) {
      throw new EmbeddedSignupError(
        "missing_code",
        sessionError ||
          "No recibimos el código de Meta. Si cerraste la ventana, vuelve a intentarlo.",
      );
    }

    // Session message can arrive slightly after the login callback.
    const deadline = Date.now() + 4000;
    while (!session && Date.now() < deadline) {
      if (sessionError) break;
      await new Promise((r) => setTimeout(r, 50));
    }

    if (sessionError && !session) {
      throw new EmbeddedSignupError("cancelled", sessionError);
    }
    if (!session) {
      throw new EmbeddedSignupError(
        "missing_session",
        "No recibimos los datos de la cuenta de WhatsApp desde Meta. Inténtalo de nuevo.",
      );
    }

    return { code, session };
  } finally {
    window.removeEventListener("message", onMessage);
  }
}
