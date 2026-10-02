import {
  initLocale,
  type LocaleParams,
  PlaceholderPage,
  placeholderMetadata,
} from "@/components/layout/placeholder-page";
import { LoginForm } from "@/features/auth/components/login-form";

export const generateMetadata = placeholderMetadata("login");

export default async function LoginPage({ params }: LocaleParams) {
  await initLocale(params);
  return (
    <PlaceholderPage pageKey="login">
      <LoginForm />
    </PlaceholderPage>
  );
}
