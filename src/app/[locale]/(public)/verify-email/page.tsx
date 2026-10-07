import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { VerifyEmail } from "@/features/auth/components/verify-email";

export const generateMetadata = pageMetadata("verifyEmail");

export default async function VerifyEmailPage({ params, searchParams }: PageProps<"/[locale]/verify-email">) {
  await initLocale(params);
  const { key } = await searchParams;
  return (
    <Page pageKey="verifyEmail" width="max-w-xl">
      <VerifyEmail verificationKey={typeof key === "string" ? key : null} />
    </Page>
  );
}
