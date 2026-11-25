import type { Metadata } from "next";
import { SimulatorPage } from "@/components/account/simulator-page";

export const metadata: Metadata = {
  title: "Simulador de chat",
};

export default function SimuladorRoutePage() {
  return <SimulatorPage />;
}
