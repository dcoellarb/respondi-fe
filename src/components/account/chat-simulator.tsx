"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  simulateWhatsAppMessage,
  simulationErrorMessage,
} from "@/api/whatsapp-simulator";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/use-analytics";
import { isApiError } from "@/api/errors";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_PROPS,
  ANALYTICS_SURFACES,
  type AnalyticsSurface,
} from "@/lib/analytics-events";
import { cn } from "@/lib/cn";
import { compactPhone } from "@/lib/phone";

type ChatRole = "customer" | "agent";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

/** Stable simulated customer for conversation memory across turns. */
const SIM_CUSTOMER_PHONE = "593999000001";

function newMessageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function businessPhoneDigits(phone: string | null | undefined) {
  if (!phone) return "";
  return compactPhone(phone).replace(/^\+/, "");
}

type ChatSimulatorProps = {
  businessName: string;
  businessPhone: string | null | undefined;
  /** account = private tester; demo = public marketing hardcode */
  variant?: "account" | "demo";
  /** Analytics surface for simulator_message_sent */
  surface?: AnalyticsSurface;
  className?: string;
  phoneClassName?: string;
  showFooterHint?: boolean;
};

export function ChatSimulator({
  businessName,
  businessPhone,
  variant = "account",
  surface = ANALYTICS_SURFACES.PRIVATE_HOME,
  className,
  phoneClassName,
  showFooterHint = true,
}: ChatSimulatorProps) {
  const listId = useId();
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const analytics = useAnalytics();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Public demo: bounce the input until the visitor types once. */
  const [hasStartedTyping, setHasStartedTyping] = useState(false);

  const digits = businessPhoneDigits(businessPhone);
  const canSend = Boolean(digits) && !pending;
  const nudgeInput = variant === "demo" && Boolean(digits) && !hasStartedTyping;

  useEffect(() => {
    analytics.capture(ANALYTICS_EVENTS.SIMULATOR_VIEW, {
      [ANALYTICS_PROPS.SURFACE]: surface,
    });
  }, [analytics, surface]);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  function append(message: ChatMessage) {
    setMessages((current) => [...current, message]);
  }

  function clearChat() {
    setMessages([]);
    setError(null);
    setDraft("");
    inputRef.current?.focus();
  }

  async function sendMessage(text: string) {
    const body = text.trim();
    if (!body || !canSend) return;

    setError(null);
    setDraft("");
    const startClean = messages.length === 0;
    append({ id: newMessageId(), role: "customer", text: body });
    setPending(true);

    analytics.capture(ANALYTICS_EVENTS.SIMULATOR_MESSAGE_SENT, {
      [ANALYTICS_PROPS.SURFACE]: surface,
      [ANALYTICS_PROPS.START_CLEAN]: startClean,
    });

    try {
      const result = await simulateWhatsAppMessage({
        businessPhoneDigits: digits,
        customerPhoneDigits: SIM_CUSTOMER_PHONE,
        text: body,
        startClean,
      });
      append({
        id: newMessageId(),
        role: "agent",
        text: result.whatsappMessage.text.body.trim(),
      });
      analytics.capture(ANALYTICS_EVENTS.SIMULATOR_REPLY_OK, {
        [ANALYTICS_PROPS.SURFACE]: surface,
        [ANALYTICS_PROPS.START_CLEAN]: startClean,
      });
    } catch (err) {
      analytics.capture(ANALYTICS_EVENTS.SIMULATOR_REPLY_ERROR, {
        [ANALYTICS_PROPS.SURFACE]: surface,
        [ANALYTICS_PROPS.START_CLEAN]: startClean,
        [ANALYTICS_PROPS.STATUS]: isApiError(err) ? err.status : undefined,
        [ANALYTICS_PROPS.ERROR_CODE]: isApiError(err)
          ? err.code || String(err.status)
          : "unknown",
      });
      setError(simulationErrorMessage(err));
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(draft);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(draft);
    }
  }

  const emptyHint =
    variant === "demo"
      ? "Escribe abajo como si fueras un cliente de CircuitFit. Es una simulación: no se envía por WhatsApp real."
      : "Escribe como un cliente. Las respuestas usan los datos de tu cuenta (simulación, no se envía por WhatsApp).";

  return (
    <div className={cn("mx-auto w-full max-w-sm", className)}>
      <div
        className={cn(
          "flex h-[40rem] flex-col overflow-hidden rounded-[2rem] border-[10px] border-ink bg-ink shadow-float",
          phoneClassName,
        )}
      >
        <div className="flex shrink-0 justify-center bg-ink pb-2 pt-3">
          <div className="h-5 w-28 rounded-full bg-ink ring-1 ring-white/15" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[1.25rem] bg-[#ece5dd]">
          <header className="flex shrink-0 items-center gap-3 bg-[#075e54] px-3 py-3 text-white">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-label font-semibold"
              aria-hidden
            >
              {businessName.trim().slice(0, 1).toUpperCase() || "R"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-label font-semibold">
                {businessName.trim() || "Tu negocio"}
              </p>
              <p className="truncate text-meta text-white/80">
                {digits ? `+${digits}` : "Sin WhatsApp de negocio"}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-control px-2 py-1 text-meta font-semibold text-white/90 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={clearChat}
              disabled={pending || messages.length === 0}
            >
              Limpiar
            </button>
          </header>

          <div
            ref={messagesRef}
            id={listId}
            className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-3"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {!digits ? (
              <p className="rounded-control bg-white/80 px-3 py-2 text-center text-meta text-muted">
                Guarda el WhatsApp del negocio en Datos del negocio para probar
                el chat.
              </p>
            ) : messages.length === 0 && !pending ? (
              <p className="rounded-control bg-white/80 px-3 py-2 text-center text-meta text-muted">
                {emptyHint}
              </p>
            ) : null}

            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}

            {pending ? (
              <div className="max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-meta text-muted shadow-sm">
                Escribiendo…
              </div>
            ) : null}
          </div>

          <form
            onSubmit={onSubmit}
            className="flex shrink-0 items-end gap-2 border-t border-black/5 bg-[#f0f0f0] px-2 py-2"
          >
            <label className="sr-only" htmlFor={`${listId}-input`}>
              Mensaje del cliente
            </label>
            <textarea
              ref={inputRef}
              id={`${listId}-input`}
              rows={1}
              value={draft}
              onChange={(event) => {
                const next = event.target.value;
                if (!hasStartedTyping && next.length > 0) {
                  setHasStartedTyping(true);
                }
                setDraft(next);
              }}
              onKeyDown={onKeyDown}
              placeholder={
                !digits
                  ? "Configura el WhatsApp primero"
                  : variant === "demo"
                    ? "Escribe aquí para probar…"
                    : "Escribe un mensaje…"
              }
              disabled={!digits || pending}
              className={cn(
                "max-h-28 min-h-11 flex-1 resize-none rounded-[1.25rem] border-0 bg-white px-3 py-2.5 text-body text-ink shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                "disabled:cursor-not-allowed disabled:opacity-60",
                nudgeInput && "simulator-input-nudge",
              )}
            />
            <Button
              type="submit"
              className="size-11 shrink-0 rounded-full px-0"
              disabled={!canSend || !draft.trim()}
              aria-label="Enviar mensaje"
            >
              ↑
            </Button>
          </form>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="form-error mt-3 rounded-control border border-[#f5c2c0] bg-[#fef3f2] px-3 py-2 text-label font-semibold"
        >
          {error}
        </p>
      ) : null}

      {showFooterHint ? (
        <p className="mt-3 text-center text-meta text-muted">
          Cliente simulado +{SIM_CUSTOMER_PHONE} · solo en memoria
        </p>
      ) : null}
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const customer = message.role === "customer";

  return (
    <div
      className={cn(
        "max-w-[85%] rounded-2xl px-3 py-2 text-body shadow-sm",
        customer
          ? "self-end rounded-tr-sm bg-[#dcf8c6] text-ink"
          : "self-start rounded-tl-sm bg-white text-ink",
      )}
    >
      {message.text}
    </div>
  );
}
