import type { Metadata } from "next";
import { FaqsPage } from "@/components/account/faqs-form";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
};

export default function PreguntasPage() {
  return <FaqsPage />;
}
