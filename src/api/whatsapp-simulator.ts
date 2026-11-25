import { getApiBaseUrl } from "@/api/config";
import { ApiError } from "@/api/errors";
import type { ErrorBody } from "@/api/types";

export type WhatsAppSimulationReply = {
  messaging_product: "whatsapp";
  recipient_type: "individual";
  to: string;
  type: "text";
  text: {
    preview_url: boolean;
    body: string;
  };
};

export type WhatsAppSimulationSuccess = {
  whatsappMessage: WhatsAppSimulationReply;
};

export type SimulateWhatsAppMessageInput = {
  businessPhoneDigits: string;
  customerPhoneDigits: string;
  text: string;
  /** When true, the backend starts the conversation from scratch. */
  startClean?: boolean;
  phoneNumberId?: string;
  signal?: AbortSignal;
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

async function parseJson(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return text ? { raw: text } : null;
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * POST /webhooks/whatsapp with isSimulation:true — runs the AI pipeline without
 * sending via Meta Cloud API.
 */
export async function simulateWhatsAppMessage(
  input: SimulateWhatsAppMessageInput,
): Promise<WhatsAppSimulationSuccess> {
  const businessPhoneDigits = digitsOnly(input.businessPhoneDigits);
  const customerPhoneDigits = digitsOnly(input.customerPhoneDigits);
  const body = input.text.trim();

  if (!businessPhoneDigits) {
    throw new ApiError(
      400,
      { error: "missing_business_phone", message: "Falta el teléfono del negocio." },
      "Falta el teléfono del negocio.",
    );
  }
  if (!customerPhoneDigits) {
    throw new ApiError(
      400,
      {
        error: "missing_customer_phone",
        message: "Falta el teléfono del cliente simulado.",
      },
      "Falta el teléfono del cliente simulado.",
    );
  }
  if (!body) {
    throw new ApiError(
      400,
      { error: "missing_text", message: "Escribe un mensaje." },
      "Escribe un mensaje.",
    );
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const messageId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `wamid.SIM-${crypto.randomUUID()}`
      : `wamid.SIM-${timestamp}-${Math.random().toString(16).slice(2)}`;

  const payload = {
    isSimulation: true,
    ...(input.startClean ? { startClean: true } : {}),
    object: "whatsapp_business_account",
    entry: [
      {
        id: "WHATSAPP_BUSINESS_ACCOUNT_ID",
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: businessPhoneDigits,
                phone_number_id:
                  input.phoneNumberId?.trim() || "SIMULATION_PHONE_NUMBER_ID",
              },
              messages: [
                {
                  from: customerPhoneDigits,
                  id: messageId,
                  timestamp,
                  type: "text",
                  text: { body },
                },
              ],
            },
          },
        ],
      },
    ],
  };

  const response = await fetch(`${getApiBaseUrl()}/webhooks/whatsapp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: input.signal,
  });

  const parsed = await parseJson(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      (parsed as ErrorBody | null) ?? null,
      `Request failed with status ${response.status}.`,
    );
  }

  const success = parsed as WhatsAppSimulationSuccess | null;
  const reply = success?.whatsappMessage?.text?.body;
  if (typeof reply !== "string" || !reply.trim()) {
    throw new ApiError(
      500,
      { error: "invalid_response" },
      "Respuesta inválida del simulador.",
    );
  }

  return success as WhatsAppSimulationSuccess;
}

export function simulationErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return (
          error.message ||
          "Revisa el mensaje o el teléfono del negocio e inténtalo de nuevo."
        );
      case 401:
        return "El webhook rechazó la solicitud (firma inválida).";
      case 403:
        return "El secreto del webhook no está configurado en el servidor.";
      case 404:
        return "No hay una cuenta Respondi con ese WhatsApp de negocio.";
      case 422:
        return (
          error.message ||
          "El agente no respondió: el mensaje no es del negocio o faltan datos para contestar. Un humano debería tomarlo."
        );
      case 502:
        return "Falló el envío a WhatsApp (no debería ocurrir en simulación).";
      case 500:
        return "Error interno del servidor al simular el mensaje.";
      default:
        break;
    }
    if (error.message) return error.message;
  }

  if (error instanceof TypeError) {
    return "No pudimos conectar con el servidor. Revisa tu conexión.";
  }

  return "Algo salió mal al simular el mensaje.";
}
