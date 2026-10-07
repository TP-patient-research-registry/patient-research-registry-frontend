import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { ConsentManager } from "@/features/consent/components/consent-manager";

export const generateMetadata = pageMetadata("participantConsents");

export default async function Route({ params }: PageProps<"/[locale]/participant/consents">) {
  await initLocale(params);
  return (
    <Page pageKey="participantConsents" width="max-w-3xl">
      <ConsentManager />
    </Page>
  );
}
