import type { ErrorBody } from "@/api/types";

export class ApiError extends Error {
  readonly status: number;
  readonly error: string;
  readonly code?: string;
  readonly missingFields?: string[];
  readonly fields?: string[];

  constructor(status: number, body: ErrorBody | null, fallbackMessage: string) {
    const message = body?.message || body?.error || fallbackMessage;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.error = body?.error || fallbackMessage;
    this.code = body?.code;
    this.missingFields = body?.missingFields;
    this.fields = body?.fields;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
