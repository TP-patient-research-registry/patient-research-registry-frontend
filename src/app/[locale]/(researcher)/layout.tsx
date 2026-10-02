import { getTranslations } from "next-intl/server";

import { AppShell } from "@/components/layout/app-shell";

// Access is enforced in src/proxy.ts (roles "researcher" | "organization").
export default async function ResearcherLayout({ children }: LayoutProps<"/[locale]">) {
  const t = await getTranslations("researcherNav");

  const items = [
    { href: "/researcher/dashboard", label: t("dashboard") },
    { href: "/researcher/studies", label: t("studies") },
    { href: "/researcher/studies/new", label: t("newStudy") },
  ];

  return (
    <AppShell navLabel={t("label")} navItems={items}>
      {children}
    </AppShell>
  );
}
