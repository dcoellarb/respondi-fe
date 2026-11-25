import type { Metadata } from "next";
import { BusinessProfilePage } from "@/components/account/business-form";

export const metadata: Metadata = {
  title: "Datos del negocio",
};

export default function BusinessPage() {
  return <BusinessProfilePage />;
}
