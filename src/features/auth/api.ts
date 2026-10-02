import { isRole, type Role } from "./roles";

export const SESSION_ENDPOINT = "/api/auth/session";

export type Session =
  | { isAuthenticated: true; user: { id: string; email: string; role: Role } }
  | { isAuthenticated: false; user: null };

const ANONYMOUS: Session = { isAuthenticated: false, user: null };

/**
 * Server-side session lookup used by the route guard (src/proxy.ts).
 * Forwards the incoming request's cookies to Django and asks who the user is.
 *
 * TODO: align the response shape with the backend once /api/auth/session exists
 *       (switch to the typed `apiClient` after `pnpm gen:api`).
 */
export async function fetchSession(cookieHeader: string | null): Promise<Session> {
  const backend = process.env.API_INTERNAL_URL ?? "http://localhost:8000";

  try {
    const response = await fetch(`${backend}${SESSION_ENDPOINT}`, {
      headers: { accept: "application/json", ...(cookieHeader ? { cookie: cookieHeader } : {}) },
      cache: "no-store",
    });
    if (!response.ok) return ANONYMOUS;

    const data: unknown = await response.json();
    return parseSession(data);
  } catch {
    // Backend unreachable → treat as anonymous; the guard redirects to /login.
    return ANONYMOUS;
  }
}

export function parseSession(data: unknown): Session {
  if (typeof data !== "object" || data === null) return ANONYMOUS;
  const user = (data as { user?: unknown }).user;
  if (typeof user !== "object" || user === null) return ANONYMOUS;

  const { id, email, role } = user as Record<string, unknown>;
  if (!isRole(role)) return ANONYMOUS;

  return { isAuthenticated: true, user: { id: String(id), email: String(email ?? ""), role } };
}

// TODO: login(credentials), logout(), register(data), verifyEmail(token) via apiClient.
