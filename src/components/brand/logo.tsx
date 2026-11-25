import Image from "next/image";
import mark from "@/assets/brand/mark.png";
import wordmark from "@/assets/brand/wordmark.png";
import { cn } from "@/lib/cn";

const sources = {
  mark,
  full: wordmark,
} as const;

const defaultHeight = {
  mark: 40,
  full: 32,
} as const;

type LogoProps = {
  variant?: keyof typeof sources;
  /** Rendered height in pixels. Width follows the artwork. */
  height?: number;
  alt?: string;
  priority?: boolean;
  className?: string;
};

export function Logo({
  variant = "full",
  height,
  alt = "Respondi",
  priority = false,
  className,
}: LogoProps) {
  const image = sources[variant];
  const resolvedHeight = height ?? defaultHeight[variant];
  const resolvedWidth = Math.round((image.width / image.height) * resolvedHeight);

  return (
    <Image
      src={image}
      alt={alt}
      width={resolvedWidth}
      height={resolvedHeight}
      priority={priority}
      className={cn(className)}
      style={{ width: resolvedWidth, height: resolvedHeight }}
    />
  );
}
