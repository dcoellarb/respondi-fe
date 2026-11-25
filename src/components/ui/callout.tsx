import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Callout({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="note"
      className={cn(
        "rounded-control bg-mint px-4 py-3 text-body text-ink",
        className,
      )}
      {...props}
    />
  );
}
