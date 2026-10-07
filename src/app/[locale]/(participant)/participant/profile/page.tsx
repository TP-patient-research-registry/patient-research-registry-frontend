import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { ProfileForm } from "@/features/profile/components/profile-form";

export const generateMetadata = pageMetadata("participantProfile");

export default async function Route({ params }: PageProps<"/[locale]/participant/profile">) {
  await initLocale(params);
  return (
    <Page pageKey="participantProfile" width="max-w-3xl">
      <ProfileForm />
    </Page>
  );
}
