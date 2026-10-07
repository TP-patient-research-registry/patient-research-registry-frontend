import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { ChangePasswordForm } from "@/features/auth/components/password-forms";

export const generateMetadata = pageMetadata("researcherSettings");

export default async function Route({ params }: PageProps<"/[locale]/researcher/settings">) {
  await initLocale(params);
  return (
    <Page pageKey="researcherSettings" width="max-w-3xl">
      <ChangePasswordForm />
    </Page>
  );
}
