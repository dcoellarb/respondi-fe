import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variantClass = {
  primary: "bg-brand text-white hover:bg-brand-hover active:bg-brand-hover",
  secondary:
    "border border-border bg-surface text-ink hover:bg-mint active:bg-mint",
} as const;

export function buttonClassName(
  variant: keyof typeof variantClass = "primary",
  className?: string,
) {
  return cn(
    "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-control px-4 text-center text-label transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variantClass[variant],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variantClass;
};

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={buttonClassName(variant, className)}
    />
  );
}
