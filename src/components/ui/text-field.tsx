"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
};

type KeyboardDefaults = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "inputMode" | "autoCapitalize" | "autoCorrect" | "spellCheck"
>;

function keyboardDefaults(
  type: InputHTMLAttributes<HTMLInputElement>["type"],
): KeyboardDefaults {
  switch (type) {
    case "email":
      return {
        inputMode: "email",
        autoCapitalize: "none",
        autoCorrect: "off",
        spellCheck: false,
      };
    case "tel":
      return {
        inputMode: "tel",
        autoCapitalize: "none",
        autoCorrect: "off",
        spellCheck: false,
      };
    case "url":
      return {
        inputMode: "url",
        autoCapitalize: "none",
        autoCorrect: "off",
        spellCheck: false,
      };
    case "number":
      return {
        inputMode: "decimal",
        autoCapitalize: "none",
        autoCorrect: "off",
        spellCheck: false,
      };
    case "search":
      return {
        inputMode: "search",
        autoCapitalize: "none",
        autoCorrect: "off",
        spellCheck: false,
      };
    case "password":
      return {
        inputMode: "text",
        autoCapitalize: "none",
        autoCorrect: "off",
        spellCheck: false,
      };
    default:
      return {
        inputMode: "text",
      };
  }
}

export function TextField({
  label,
  hint,
  error,
  id,
  className,
  type = "text",
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const isPassword = type === "password";
  const [passwordVisible, setPasswordVisible] = useState(false);
  const resolvedType = isPassword && passwordVisible ? "text" : type;
  const defaults = keyboardDefaults(type);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="text-label text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          {...defaults}
          {...props}
          type={resolvedType}
          className={cn(
            "min-h-11 w-full rounded-control border bg-surface px-3 text-body text-ink",
            "placeholder:text-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isPassword && "pr-12",
            error
              ? "border-form-error focus-visible:border-form-error focus-visible:ring-form-error"
              : "border-border focus-visible:border-brand focus-visible:ring-brand",
            className,
          )}
        />
        {isPassword ? (
          <button
            type="button"
            className="absolute top-1/2 right-1.5 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-control text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={
              passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            aria-pressed={passwordVisible}
            onClick={() => setPasswordVisible((value) => !value)}
            disabled={props.disabled}
          >
            {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        ) : null}
      </div>
      {hint ? (
        <p id={hintId} className="text-meta text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="form-error text-label font-semibold">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.7a2.75 2.75 0 0 0 3.7 3.7" />
      <path d="M9.9 5.6A10.4 10.4 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16.8 16.8 0 0 1-2.2 2.8" />
      <path d="M6.7 6.8C4.2 8.5 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.3 0 2.5-.2 3.6-.6" />
    </svg>
  );
}
