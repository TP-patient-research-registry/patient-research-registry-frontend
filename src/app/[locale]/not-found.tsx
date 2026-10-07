import { getTranslations } from "next-intl/server";

import { MainContent } from "@/components/layout/main-content";
import { PageHeader } from "@/components/layout/page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("pages.notFound");
  return (
    <>
      <SiteHeader />
      <MainContent className="px-4 py-10">
        <div className="mx-auto flex max-w-xl flex-col gap-6">
          <PageHeader pageKey="notFound" />
          <Button asChild className="self-start">
            <Link href="/">{t("home")}</Link>
          </Button>
        </div>
      </MainContent>
      <SiteFooter />
    </>
  );
}
