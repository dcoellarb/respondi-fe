import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { site } from "@/lib/site";

const links = [
  { href: "/acerca", label: "Acerca de Respondi" },
  {
    href: site.contactEmail ? `mailto:${site.contactEmail}` : "/acerca#contacto",
    label: "Contacto",
  },
  { href: "/terminos", label: "Términos y condiciones" },
  { href: "/privacidad", label: "Política de privacidad" },
];

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const className =
    "inline-flex min-h-11 items-center rounded-control text-label font-bold text-brand underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-canvas">
      <div className="mx-auto flex w-full max-w-site flex-col gap-6 px-4 py-8 md:px-12">
        <Link
          href="/"
          aria-label="Respondi, inicio"
          className="w-fit rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Logo alt="" height={28} />
        </Link>
        <nav aria-label="Pie de página">
          <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-3">
            {links.map((link) => (
              <li key={link.label}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
