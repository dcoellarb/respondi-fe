import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/structured-data";

type Crumb = { name: string; path: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail = [{ name: "Inicio", path: "/" }, ...items];

  return (
    <nav aria-label="Miga de pan">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <ol className="flex flex-wrap items-center gap-2 text-meta text-muted">
        {trail.map((item, index) => {
          const last = index === trail.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {last ? (
                <span aria-current="page" className="text-ink">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="rounded-control text-brand underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
