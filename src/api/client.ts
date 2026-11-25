import { getApiBaseUrl } from "@/api/config";
import { ApiError } from "@/api/errors";
import { getAccessToken } from "@/api/session";
import type { DataEnvelope, ErrorBody } from "@/api/types";

type QueryValue = string | number | boolean | null | undefined;

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  /**
   * true: send the stored Cognito access token
   * string: send that bearer token
   * false / omitted: no Authorization header
   */
  auth?: boolean | string;
  signal?: AbortSignal;
  headers?: HeadersInit;
};

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const base = getApiBaseUrl().replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

function resolveAccessToken(auth: ApiRequestOptions["auth"]) {
  if (auth === false || auth === undefined) return null;
  if (typeof auth === "string") return auth;
  return getAccessToken();
}

async function parseBody(response: Response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return text ? { raw: text } : null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = "GET", body, query, auth = false, signal, headers } = options;
  const accessToken = resolveAccessToken(auth);

  if (auth === true && !accessToken) {
    throw new ApiError(401, { error: "unauthorized" }, "Missing access token.");
  }

  const requestHeaders = new Headers(headers);
  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const parsed = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      (parsed as ErrorBody | null) ?? null,
      `Request failed with status ${response.status}.`,
    );
  }

  return parsed as T;
}

export async function apiData<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const envelope = await apiRequest<DataEnvelope<T>>(path, options);
  if (
    !envelope ||
    typeof envelope !== "object" ||
    !("data" in envelope) ||
    envelope.data === undefined
  ) {
    throw new ApiError(
      500,
      { error: "invalid_response" },
      "Respuesta inválida del servidor.",
    );
  }
  return envelope.data;
}
