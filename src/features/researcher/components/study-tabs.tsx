"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Secondary navigation between the management pages of one study. */
export function StudyTabs({ studyId }: { studyId: string }) {
  const t = useTranslations("researcher.study.tabs");
  const pathname = usePathname();
  const base = `/researcher/studies/${studyId}`;
  const tabs = [
    { href: base, label: t("details") },
    { href: `${base}/participants`, label: t("participants") },
    { href: `${base}/questionnaires`, label: t("questionnaires") },
  ];

  return (
    <nav aria-label={t("label")} className="border-b">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {tabs.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block border-b-2 px-3 py-2 text-sm whitespace-nowrap",
                  active
                    ? "border-primary font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
