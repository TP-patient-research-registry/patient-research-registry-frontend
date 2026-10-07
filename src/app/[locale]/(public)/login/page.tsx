import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { LoginForm } from "@/features/auth/components/login-form";

export const generateMetadata = pageMetadata("login");

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  await initLocale(params);
  const { next } = await searchParams;
  return (
    <Page pageKey="login" width="max-w-sm">
      <LoginForm next={typeof next === "string" ? next : null} />
    </Page>
  );
}
