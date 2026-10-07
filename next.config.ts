import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  // Django API URLs end with "/" — Next's automatic slash stripping would loop with Django's
  // APPEND_SLASH redirect. Pages still drop trailing slashes, handled in src/proxy.ts.
  skipTrailingSlashRedirect: true,
};

export default withNextIntl(nextConfig);
