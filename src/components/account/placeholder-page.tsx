import { accountNav } from "@/components/account/account-nav";

type PlaceholderPageProps = {
  href: (typeof accountNav)[number]["href"];
};

export function PlaceholderPage({ href }: PlaceholderPageProps) {
  const item = accountNav.find((entry) => entry.href === href);

  if (!item) return null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-page-title">{item.label}</h1>
      <p className="max-w-xl text-body text-muted">{item.description}</p>
      <div className="rounded-card border border-dashed border-border bg-surface px-4 py-8 md:px-6">
        <p className="text-body text-ink">
          Esta pantalla estará disponible pronto. Aquí configurarás{" "}
          {item.label.toLowerCase()}.
        </p>
      </div>
    </div>
  );
}
