import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { ForgotPasswordForm } from "@/features/auth/components/password-forms";

export const generateMetadata = pageMetadata("forgotPassword");

export default async function ForgotPasswordPage({ params }: PageProps<"/[locale]/forgot-password">) {
  await initLocale(params);
  return (
    <Page pageKey="forgotPassword" width="max-w-sm">
      <ForgotPasswordForm />
    </Page>
  );
}
