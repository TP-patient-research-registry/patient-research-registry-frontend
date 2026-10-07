import { getCsrfToken } from "@/lib/api/csrf";

import { isRole, type Role } from "./roles";

export const SESSION_ENDPOINT = "/api/auth/session";

/** Browser-side API base (same origin, proxied to Django by src/proxy.ts). */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export type SessionUser = { id: string; email: string; role: Role; firstName: string; lastName: string };

export type Session = { isAuthenticated: true; user: SessionUser } | { isAuthenticated: false; user: null };

const ANONYMOUS: Session = { isAuthenticated: false, user: null };

/**
 * Server-side session lookup used by the route guard (src/proxy.ts).
 * Forwards the incoming request's cookies to Django and asks who the user is.
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

  const { id, email, role, first_name: firstName, last_name: lastName } = user as Record<string, unknown>;
  if (!isRole(role)) return ANONYMOUS;

  return {
    isAuthenticated: true,
    user: {
      id: String(id),
      email: String(email ?? ""),
      role,
      firstName: String(firstName ?? ""),
      lastName: String(lastName ?? ""),
    },
  };
}

/** Client-side session lookup (also sets the `csrftoken` cookie). */
export async function getSession(): Promise<Session> {
  const response = await fetch(`${API_BASE}/auth/session`, {
    headers: { accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) return ANONYMOUS;
  return parseSession(await response.json());
}

// --- django-allauth headless (browser client) ------------------------------------------------
// Not part of the generated OpenAPI types; spec at /api/auth/openapi.html.

const ALLAUTH_BASE = `${API_BASE}/auth/browser/v1`;

type AllauthFlow = { id: string; is_pending?: boolean };
type AllauthBody = {
  status: number;
  data?: { flows?: AllauthFlow[]; user?: unknown };
  errors?: { message: string; code: string; param?: string }[];
  meta?: { is_authenticated?: boolean };
};

/** Outcome of an allauth call: done, or waiting for another step (email verification, 2FA code). */
export type AuthResult = { status: "ok" } | { status: "pending"; flow: "verify_email" | "mfa_authenticate" };

export class AuthError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly param?: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

async function ensureCsrfCookie() {
  if (!getCsrfToken()) await getSession();
}

async function allauth(path: string, init: { method: string; body?: unknown }): Promise<AllauthBody> {
  await ensureCsrfCookie();
  const response = await fetch(`${ALLAUTH_BASE}${path}`, {
    method: init.method,
    credentials: "include",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "X-CSRFToken": getCsrfToken() ?? "",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const body = (await response.json().catch(() => ({ status: response.status }))) as AllauthBody;
  if (body.status === 400 || body.status === 409 || body.status === 429 || body.status >= 500) {
    const first = body.errors?.[0];
    throw new AuthError(first?.message ?? response.statusText, first?.code ?? "error", first?.param);
  }
  return body;
}

function toResult(body: AllauthBody): AuthResult {
  if (body.status === 200) return { status: "ok" };
  const pending = body.data?.flows?.find((flow) => flow.is_pending)?.id;
  if (pending === "verify_email" || pending === "mfa_authenticate")
    return { status: "pending", flow: pending };
  throw new AuthError("Unexpected authentication state.", "unexpected");
}

export async function login(email: string, password: string): Promise<AuthResult> {
  return toResult(await allauth("/auth/login", { method: "POST", body: { email, password } }));
}

export async function authenticateTotp(code: string): Promise<AuthResult> {
  return toResult(await allauth("/auth/2fa/authenticate", { method: "POST", body: { code } }));
}

export async function signup(data: { email: string; password: string; role: "participant" | "researcher" }) {
  return toResult(await allauth("/auth/signup", { method: "POST", body: data }));
}

export async function logout(): Promise<void> {
  // allauth answers 401 once the session is gone; that is the success case here.
  await allauth("/auth/session", { method: "DELETE" });
}

export async function verifyEmail(key: string): Promise<AuthResult> {
  const body = await allauth("/auth/email/verify", { method: "POST", body: { key } });
  return body.status === 200 ? { status: "ok" } : { status: "pending", flow: "verify_email" };
}

export async function resendVerificationEmail(): Promise<void> {
  await allauth("/auth/email/verify/resend", { method: "POST" });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await allauth("/auth/password/request", { method: "POST", body: { email } });
}

export async function resetPassword(key: string, password: string): Promise<void> {
  await allauth("/auth/password/reset", { method: "POST", body: { key, password } });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await allauth("/account/password/change", {
    method: "POST",
    body: { current_password: currentPassword, new_password: newPassword },
  });
}
