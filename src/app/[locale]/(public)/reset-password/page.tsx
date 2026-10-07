import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { ResetPasswordForm } from "@/features/auth/components/password-forms";

export const generateMetadata = pageMetadata("resetPassword");

export default async function ResetPasswordPage({
  params,
  searchParams,
}: PageProps<"/[locale]/reset-password">) {
  await initLocale(params);
  const { key } = await searchParams;
  return (
    <Page pageKey="resetPassword" width="max-w-sm">
      <ResetPasswordForm resetKey={typeof key === "string" ? key : null} />
    </Page>
  );
}
