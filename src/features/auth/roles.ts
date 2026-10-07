export const ROLES = ["participant", "researcher", "organization"] as const;
export type Role = (typeof ROLES)[number];

/** Path prefixes (without locale) that require one of the listed roles. */
const PROTECTED_AREAS: ReadonlyArray<{ prefix: string; roles: readonly Role[] }> = [
  { prefix: "/participant", roles: ["participant"] },
  { prefix: "/researcher", roles: ["researcher", "organization"] },
];

/** Returns the roles allowed to access `pathname` (locale already stripped), or `null` if public. */
export function getRequiredRoles(pathname: string): readonly Role[] | null {
  const area = PROTECTED_AREAS.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return area?.roles ?? null;
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** Landing page after login for each role. */
export function dashboardPath(role: Role): string {
  return role === "participant" ? "/participant/dashboard" : "/researcher/dashboard";
}

/**
 * Only follow same-site relative `?next=` targets (prevents open redirects).
 * Returns the path without its locale prefix so the locale-aware router can re-add it.
 */
export function safeNextPath(next: string | null | undefined, locales: readonly string[]): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  const [, first, ...rest] = next.split("/");
  return locales.includes(first) ? `/${rest.join("/")}` : next;
}
