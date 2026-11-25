import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
};

export function Card({
  padded = true,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface",
        padded && "p-4 md:p-6",
        className,
      )}
      {...props}
    />
  );
}
