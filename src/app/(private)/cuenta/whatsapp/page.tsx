import type { Metadata } from "next";
import { WhatsAppConnectPage } from "@/components/account/whatsapp-connect-page";

export const metadata: Metadata = {
  title: "WhatsApp",
};

export default function WhatsAppPage() {
  return <WhatsAppConnectPage />;
}
