import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { ForbiddenActions } from "@/features/auth/components/forbidden-actions";

export const generateMetadata = pageMetadata("forbidden");

export default async function ForbiddenPage({ params }: PageProps<"/[locale]/403">) {
  await initLocale(params);
  return (
    <Page pageKey="forbidden" width="max-w-xl">
      <ForbiddenActions />
    </Page>
  );
}
