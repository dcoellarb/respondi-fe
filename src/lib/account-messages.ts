import { isApiError } from "@/api/errors";

export function accountErrorMessage(error: unknown) {
  if (isApiError(error)) {
    switch (error.code) {
      case "MISSING_REQUIRED_FIELDS":
        return "Completa todos los campos obligatorios.";
      case "UNKNOWN_FIELD":
        return "El servidor rechazó algunos campos del producto. Inténtalo de nuevo.";
      case "INVALID_PHONE":
        return "Usa un teléfono en formato internacional, por ejemplo +593991234567.";
      case "VALIDATION_ERROR":
      case "INVALID_BODY":
      case "INVALID_FIELD":
      case "INVALID_PRICE":
      case "INVALID_IMAGE_URL":
      case "INVALID_CURRENCY":
        return (
          error.message ||
          "Revisa el formato de los campos e inténtalo de nuevo."
        );
      case "PHONE_IN_USE":
        return "Ese número de WhatsApp ya está vinculado a otra cuenta de Respondi.";
      case "ACCOUNT_NOT_FOUND":
        return "Primero guarda los datos del negocio para conectar WhatsApp.";
      case "RATE_LIMIT_EXCEEDED":
        return "Demasiados intentos. Inténtalo más tarde.";
      case "invalid_response":
        return "Respuesta inválida del servidor.";
      case "INTERNAL_ERROR":
        return "Error interno del servidor al guardar. Inténtalo de nuevo.";
      case "META_GRAPH_ERROR":
      case "META_ERROR":
        return (
          error.message ||
          "Meta no pudo completar la conexión. Inténtalo de nuevo en unos segundos."
        );
      case "INVALID_HOURS":
      case "OVERLAPPING_HOURS":
      case "MISSING_HOURS":
      case "SCHEDULE_MODE_CONFLICT":
        return (
          error.message ||
          "Revisa los horarios e inténtalo de nuevo."
        );
      default:
        break;
    }

    if (error.status === 401) {
      return "Tu sesión expiró. Vuelve a iniciar sesión.";
    }
    if (error.status === 404) {
      return (
        error.message ||
        "Primero guarda los datos del negocio para conectar WhatsApp."
      );
    }
    if (error.status === 502) {
      return (
        error.message ||
        "Meta no respondió a tiempo. El código de conexión caduca en ~30 segundos; vuelve a intentarlo."
      );
    }
    if (error.status === 500 || error.code === "INTERNAL_ERROR") {
      return "Error interno del servidor al guardar. Inténtalo de nuevo.";
    }
    if (error.status === 409) {
      return (
        error.message ||
        "Ese número de WhatsApp ya está vinculado a otra cuenta de Respondi."
      );
    }
    if (error.status === 422 || error.status === 400) {
      return error.message || "Revisa el formato de los campos e inténtalo de nuevo.";
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
