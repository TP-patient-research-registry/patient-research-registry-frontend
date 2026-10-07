import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { ParticipantDashboard } from "@/features/participant/components/participant-dashboard";

export const generateMetadata = pageMetadata("participantDashboard");

export default async function Route({ params }: PageProps<"/[locale]/participant/dashboard">) {
  await initLocale(params);
  return (
    <Page pageKey="participantDashboard" width="max-w-5xl">
      <ParticipantDashboard />
    </Page>
  );
}
