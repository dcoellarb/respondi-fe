import type {
  AuthSession,
  AuthTokens,
  AuthUser,
  SocialAuthSession,
} from "@/api/types";

const STORAGE_KEY = "respondi.auth.session";

export type StoredAuthSession = {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: AuthUser;
};

type Listener = () => void;

const listeners = new Set<Listener>();

/** Cached so useSyncExternalStore getSnapshot stays referentially stable. */
let cachedRaw: string | null | undefined;
let cachedSession: StoredAuthSession | null = null;

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function invalidateAuthSessionCache() {
  cachedRaw = undefined;
  cachedSession = null;
}

function emitAuthSessionChange() {
  invalidateAuthSessionCache();
  for (const listener of listeners) {
    listener();
  }
}

function onStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY || event.key === null) {
    emitAuthSessionChange();
  }
}

export function subscribeAuthSession(listener: Listener) {
  listeners.add(listener);

  if (canUseStorage() && listeners.size === 1) {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    listeners.delete(listener);
    if (canUseStorage() && listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function readAuthSession(): StoredAuthSession | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedSession;

    cachedRaw = raw;
    if (!raw) {
      cachedSession = null;
      return null;
    }

    const parsed = JSON.parse(raw) as StoredAuthSession;
    if (!parsed.accessToken || !parsed.idToken) {
      cachedSession = null;
      return null;
    }

    cachedSession = parsed;
    return cachedSession;
  } catch {
    cachedRaw = undefined;
    cachedSession = null;
    return null;
  }
}

export function writeAuthSession(session: StoredAuthSession) {
  if (!canUseStorage()) return;
  const raw = JSON.stringify(session);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedSession = session;
  for (const listener of listeners) {
    listener();
  }
}

export function clearAuthSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  cachedRaw = null;
  cachedSession = null;
  for (const listener of listeners) {
    listener();
  }
}

export function getAccessToken() {
  return readAuthSession()?.accessToken ?? null;
}

export function getRefreshToken() {
  return readAuthSession()?.refreshToken ?? null;
}

function toStoredSession(
  tokens: AuthTokens,
  user?: AuthUser,
): StoredAuthSession {
  return {
    accessToken: tokens.AccessToken,
    idToken: tokens.IdToken,
    refreshToken: tokens.RefreshToken,
    expiresAt:
      typeof tokens.ExpiresIn === "number"
        ? Date.now() + tokens.ExpiresIn * 1000
        : undefined,
    user,
  };
}

export function persistAuthSession(session: AuthSession | SocialAuthSession) {
  const tokens = session?.authResponse;
  if (!tokens?.AccessToken || !tokens?.IdToken) {
    throw new Error("La respuesta de autenticación no incluye tokens.");
  }
  writeAuthSession(toStoredSession(tokens, session.user));
}

export function persistRefreshedTokens(tokens: AuthTokens) {
  if (!tokens?.AccessToken || !tokens?.IdToken) {
    throw new Error("La respuesta de autenticación no incluye tokens.");
  }
  const current = readAuthSession();
  writeAuthSession({
    ...toStoredSession(tokens, current?.user),
    refreshToken: tokens.RefreshToken ?? current?.refreshToken,
  });
}
