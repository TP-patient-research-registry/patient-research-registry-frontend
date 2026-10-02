import type { ReactNode } from "react";

import { MainContent } from "./main-content";
import { SidebarNav, type SidebarNavItem } from "./sidebar-nav";
import { SiteHeader } from "./site-header";

/** Layout for authenticated areas: header + sidebar navigation + main content. */
export function AppShell({
  navLabel,
  navItems,
  children,
}: {
  navLabel: string;
  navItems: SidebarNavItem[];
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row">
        <aside className="border-b bg-sidebar p-4 md:w-64 md:shrink-0 md:border-r md:border-b-0">
          <SidebarNav label={navLabel} items={navItems} />
        </aside>
        <MainContent className="p-6">{children}</MainContent>
      </div>
    </>
  );
}
