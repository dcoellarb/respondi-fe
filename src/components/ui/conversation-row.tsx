import { cn } from "@/lib/cn";

type ConversationRowProps = {
  name: string;
  message: string;
  timestamp: string;
  selected?: boolean;
  onSelect?: () => void;
};

export function ConversationRow({
  name,
  message,
  timestamp,
  selected = false,
  onSelect,
}: ConversationRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full min-h-11 cursor-pointer items-start gap-3 px-4 py-3 text-left md:px-6",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset",
        selected ? "bg-mint" : "bg-surface hover:bg-canvas",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-label text-ink">{name}</span>
        <span className="mt-1 block truncate text-body text-ink">{message}</span>
      </span>
      <time className="shrink-0 text-meta text-muted">{timestamp}</time>
    </button>
  );
}
