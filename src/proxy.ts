import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { fetchSession } from "@/features/auth/api";
import { getRequiredRoles } from "@/features/auth/roles";
import { routing } from "@/i18n/routing";

/**
 * Next.js 16 "proxy" (formerly middleware.ts):
 *  1. forwards /api/* to the Django backend (same-origin → session + CSRF cookies work),
 *  2. guards the participant / researcher areas via GET /api/auth/session,
 *  3. hands everything else to next-intl for locale detection & prefixing.
 */
const handleI18n = createIntlMiddleware(routing);

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:8000";

function splitLocale(pathname: string): { locale: string; path: string } {
  const [, maybeLocale, ...rest] = pathname.split("/");
  if ((routing.locales as readonly string[]).includes(maybeLocale)) {
    return { locale: maybeLocale, path: `/${rest.join("/")}` };
  }
  return { locale: routing.defaultLocale, path: pathname };
}

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return NextResponse.rewrite(new URL(`${pathname}${search}`, API_INTERNAL_URL));
  }

  // Pages: canonical URLs have no trailing slash (see skipTrailingSlashRedirect in next.config.ts).
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return NextResponse.redirect(new URL(`${pathname.replace(/\/+$/, "")}${search}`, request.url), 308);
  }

  const { locale, path } = splitLocale(pathname);
  const requiredRoles = getRequiredRoles(path);

  if (requiredRoles) {
    const session = await fetchSession(request.headers.get("cookie"));

    if (!session.isAuthenticated) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
    if (!requiredRoles.includes(session.user.role)) {
      return NextResponse.redirect(new URL(`/${locale}/403`, request.url));
    }
  }

  return handleI18n(request);
}

export const config = {
  matcher: [
    "/api/:path*",
    // Pages: everything except API, Next internals and files with an extension (static assets).
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
