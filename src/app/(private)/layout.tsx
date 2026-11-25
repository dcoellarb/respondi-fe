import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AccountShell } from "@/components/account/account-shell";
import { QueryProvider } from "@/api/query-provider";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AccountShell>{children}</AccountShell>
    </QueryProvider>
  );
}
