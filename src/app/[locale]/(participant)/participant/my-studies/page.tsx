import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { MyStudies } from "@/features/participant/components/my-studies";

export const generateMetadata = pageMetadata("participantMyStudies");

export default async function Route({ params }: PageProps<"/[locale]/participant/my-studies">) {
  await initLocale(params);
  return (
    <Page pageKey="participantMyStudies" width="max-w-5xl">
      <MyStudies />
    </Page>
  );
}
