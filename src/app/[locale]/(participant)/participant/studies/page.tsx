import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { FindStudies } from "@/features/participant/components/find-studies";

export const generateMetadata = pageMetadata("participantStudies");

export default async function Route({ params }: PageProps<"/[locale]/participant/studies">) {
  await initLocale(params);
  return (
    <Page pageKey="participantStudies" width="max-w-5xl">
      <FindStudies />
    </Page>
  );
}
