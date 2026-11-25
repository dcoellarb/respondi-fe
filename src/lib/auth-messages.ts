import { isApiError } from "@/api/errors";

export function authErrorMessage(error: unknown) {
  if (isApiError(error)) {
    switch (error.code) {
      case "USER_ALREADY_EXISTS":
        return "Ya existe una cuenta con este correo.";
      case "INVALID_CREDENTIALS":
        return "Correo o contraseña incorrectos.";
      case "INVALID_PASSWORD":
        return (
          error.message ||
          "La contraseña no cumple los requisitos de seguridad."
        );
      case "EMAIL_NOT_CONFIRMED":
        return "Confirma tu correo antes de iniciar sesión.";
      case "PASSWORD_RESET_REQUIRED":
        return "Debes restablecer tu contraseña antes de iniciar sesión.";
      case "RATE_LIMIT_EXCEEDED":
        return "Demasiados intentos. Inténtalo más tarde.";
      case "MISSING_REQUIRED_FIELDS":
        return "Completa todos los campos obligatorios.";
      case "invalid_response":
        return "Respuesta inválida del servidor.";
      default:
        break;
    }

    if (error.status === 401) {
      return "Correo o contraseña incorrectos.";
    }
    if (error.status === 409) {
      return "Ya existe una cuenta con este correo.";
    }
    if (error.status === 429) {
      return "Demasiados intentos. Inténtalo más tarde.";
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof TypeError) {
    return "No pudimos conectar con el servidor. Revisa tu conexión.";
  }

  return "Algo salió mal. Inténtalo de nuevo.";
}

export function isStrongPassword(password: string) {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
