const CSRF_COOKIE = "csrftoken";

/** Reads Django's CSRF token from the `csrftoken` cookie (browser only). */
export function getCsrfToken(cookieString?: string): string | undefined {
  const source = cookieString ?? (typeof document === "undefined" ? "" : document.cookie);

  for (const part of source.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === CSRF_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}
