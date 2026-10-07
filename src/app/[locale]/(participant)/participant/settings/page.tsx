import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { Settings } from "@/features/participant/components/settings";

export const generateMetadata = pageMetadata("participantSettings");

export default async function Route({ params }: PageProps<"/[locale]/participant/settings">) {
  await initLocale(params);
  return (
    <Page pageKey="participantSettings" width="max-w-3xl">
      <Settings />
    </Page>
  );
}
