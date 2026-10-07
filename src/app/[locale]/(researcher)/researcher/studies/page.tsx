import { FilePlus2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { ResearcherStudiesTable } from "@/features/researcher/components/researcher-studies-table";
import { Link } from "@/i18n/navigation";

export const generateMetadata = pageMetadata("researcherStudies");

export default async function Route({ params }: PageProps<"/[locale]/researcher/studies">) {
  await initLocale(params);
  const t = await getTranslations("researcherNav");
  return (
    <Page
      pageKey="researcherStudies"
      actions={
        <Button asChild>
          <Link href="/researcher/studies/new">
            <FilePlus2 aria-hidden />
            {t("newStudy")}
          </Link>
        </Button>
      }
    >
      <ResearcherStudiesTable filterable />
    </Page>
  );
}
