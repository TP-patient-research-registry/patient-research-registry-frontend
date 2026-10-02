import { getTranslations } from "next-intl/server";

import { AppShell } from "@/components/layout/app-shell";

// Access is enforced in src/proxy.ts (role "participant").
export default async function ParticipantLayout({ children }: LayoutProps<"/[locale]">) {
  const t = await getTranslations("participantNav");

  const items = [
    { href: "/participant/dashboard", label: t("dashboard") },
    { href: "/participant/profile", label: t("profile") },
    { href: "/participant/consents", label: t("consents") },
    { href: "/participant/studies", label: t("studies") },
    { href: "/participant/my-studies", label: t("myStudies") },
    { href: "/participant/questionnaires", label: t("questionnaires") },
    { href: "/participant/my-data", label: t("myData") },
    { href: "/participant/settings", label: t("settings") },
  ];

  return (
    <AppShell navLabel={t("label")} navItems={items}>
      {children}
    </AppShell>
  );
}
