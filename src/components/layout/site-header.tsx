import { Activity } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/features/auth/components/user-menu";
import { Link } from "@/i18n/navigation";

import { LocaleSwitcher } from "./locale-switcher";

export async function SiteHeader() {
  const t = await getTranslations();

  return (
    <header className="border-b bg-background/95">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold">
          <Activity className="size-5 text-primary" aria-hidden />
          {t("metadata.siteName")}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label={t("header.primaryNav")}>
            <Button asChild variant="ghost">
              <Link href="/studies">{t("header.studies")}</Link>
            </Button>
          </nav>
          <UserMenu />
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
