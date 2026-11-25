const DEFAULT_API_HOST =
  "https://q3zxmscrjj.execute-api.us-east-2.amazonaws.com/prod/";

/**
 * OpenAPI paths are relative to the /api base on the API Gateway stage.
 * NEXT_PUBLIC_API_URL may be the stage host (.../prod/) or the full /api base.
 */
export function getApiBaseUrl() {
  const configured =
    process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_HOST;
  const withoutTrailingSlash = configured.replace(/\/+$/, "");
  return withoutTrailingSlash.endsWith("/api")
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
}
