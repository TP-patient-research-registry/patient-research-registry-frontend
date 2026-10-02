"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type SidebarNavItem = { href: string; label: string };

export function SidebarNav({ label, items }: { label: string; items: SidebarNavItem[] }) {
  const pathname = usePathname();
  // Longest matching prefix wins, so /researcher/studies/new doesn't also highlight /researcher/studies.
  const active = items
    .filter(({ href }) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav aria-label={label}>
      <ul className="flex flex-col gap-1">
        {items.map(({ href, label: itemLabel }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={href === active ? "page" : undefined}
              className={cn(
                "block rounded-md px-3 py-2 text-sm",
                href === active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60",
              )}
            >
              {itemLabel}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
