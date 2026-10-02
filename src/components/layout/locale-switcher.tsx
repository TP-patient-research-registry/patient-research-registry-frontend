"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LABELS: Record<(typeof routing.locales)[number], { short: string; name: string }> = {
  sk: { short: "SK", name: "Slovenčina" },
  en: { short: "EN", name: "English" },
};

export function LocaleSwitcher() {
  const t = useTranslations("common");
  const current = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t("language")}>
      <ul className="flex gap-1">
        {routing.locales.map((locale) => (
          <li key={locale}>
            <Link
              href={pathname}
              locale={locale}
              lang={locale}
              hrefLang={locale}
              aria-current={locale === current ? "true" : undefined}
              aria-label={LABELS[locale].name}
              className={cn(
                "rounded-md px-2 py-1 text-sm",
                locale === current ? "bg-muted font-semibold" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {LABELS[locale].short}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
