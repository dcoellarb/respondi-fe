import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function TextLink({
  className,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "rounded-control font-semibold text-brand underline underline-offset-4",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  );
}
