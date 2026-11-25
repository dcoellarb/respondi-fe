import type { Metadata } from "next";
import { AddressesPage } from "@/components/account/addresses-form";

export const metadata: Metadata = {
  title: "Direcciones y horarios",
};

export default function DireccionesPage() {
  return <AddressesPage />;
}
