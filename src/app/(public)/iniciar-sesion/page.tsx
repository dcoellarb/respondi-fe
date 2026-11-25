import { publicMetadata } from "@/lib/metadata";
import { LoginClient } from "./login-client";

export const dynamic = "force-dynamic";

export const metadata = publicMetadata({
  title: "Iniciar sesión",
  description:
    "Inicia sesión en Respondi para entrar al área privada de tu cuenta. La configuración del negocio y WhatsApp viven ahí.",
  path: "/iniciar-sesion",
});

export default function LoginPage() {
  return <LoginClient />;
}
