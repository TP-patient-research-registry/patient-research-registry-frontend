import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { RegisterForm } from "@/features/auth/components/register-form";

export const generateMetadata = pageMetadata("register");

export default async function RegisterPage({ params }: PageProps<"/[locale]/register">) {
  await initLocale(params);
  return (
    <Page pageKey="register" width="max-w-xl">
      <RegisterForm />
    </Page>
  );
}
