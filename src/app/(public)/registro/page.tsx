import { publicMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { RegisterClient } from "./register-client";

export const dynamic = "force-dynamic";

export const metadata = publicMetadata({
  title: "Crear mi cuenta",
  description: `Crea tu cuenta de Respondi. Crear la cuenta no contrata el plan ni genera un cobro. ${site.priceLabel} se confirma antes de pagar.`,
  path: "/registro",
});

export default function RegisterPage() {
  return <RegisterClient />;
}
