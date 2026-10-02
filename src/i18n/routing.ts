import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sk", "en"],
  defaultLocale: "sk",
  // Every URL carries its locale (/sk/..., /en/...), which keeps route guards simple.
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
