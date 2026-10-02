import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

import { LocaleSwitcher } from "./locale-switcher";

export async function SiteHeader() {
  const t = await getTranslations();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-heading text-lg font-semibold">
          {t("metadata.siteName")}
        </Link>
        <nav aria-label={t("header.primaryNav")} className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/studies">{t("header.studies")}</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/login">{t("header.login")}</Link>
          </Button>
          <Button asChild>
            <Link href="/register">{t("header.register")}</Link>
          </Button>
        </nav>
        {/* TODO: show user menu (dropdown-menu) + logout when authenticated */}
        <LocaleSwitcher />
      </div>
    </header>
  );
}
