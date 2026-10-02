import createClient, { type Middleware } from "openapi-fetch";

import { getCsrfToken } from "./csrf";
import type { paths } from "./schema";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);

/**
 * Browser: same-origin `/api` (proxied to Django by src/proxy.ts, so session cookies just work).
 * Server: talks to the backend directly over the internal network.
 */
const baseUrl =
  typeof window === "undefined"
    ? `${process.env.API_INTERNAL_URL ?? "http://localhost:8000"}/api`
    : (process.env.NEXT_PUBLIC_API_URL ?? "/api");

/** Adds Django's CSRF header to unsafe requests. */
const csrfMiddleware: Middleware = {
  onRequest({ request }) {
    if (!SAFE_METHODS.has(request.method)) {
      const token = getCsrfToken();
      if (token) request.headers.set("X-CSRFToken", token);
    }
    return request;
  },
};

export const apiClient = createClient<paths>({
  baseUrl,
  credentials: "include",
});

apiClient.use(csrfMiddleware);
