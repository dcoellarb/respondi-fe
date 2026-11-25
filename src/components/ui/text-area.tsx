"use client";

import { useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
};

export function TextArea({
  label,
  hint,
  error,
  id,
  className,
  ...props
}: TextAreaProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="text-label text-ink">
        {label}
      </label>
      <textarea
        id={fieldId}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(
          "min-h-28 w-full resize-y rounded-control border bg-surface px-3 py-3 text-body text-ink",
          "placeholder:text-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-form-error focus-visible:border-form-error focus-visible:ring-form-error"
            : "border-border focus-visible:border-brand focus-visible:ring-brand",
          className,
        )}
        {...props}
      />
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
