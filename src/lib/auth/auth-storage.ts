import type { AuthSession } from "@/lib/api/auth-types";

const storageKey = "sc-platform-auth-session";

type StoredAuthSession = Pick<
  AuthSession,
  "access_token" | "refresh_token" | "expires_at" | "token_type" | "user" | "context"
>;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadStoredSession(): StoredAuthSession | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuthSession;
  } catch {
    return null;
  }
}

export function saveStoredSession(session: AuthSession) {
  if (!canUseStorage()) return;

  const stored: StoredAuthSession = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    token_type: session.token_type,
    user: session.user,
    context: session.context,
  };

  window.localStorage.setItem(storageKey, JSON.stringify(stored));
}

export function clearStoredSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(storageKey);
}
