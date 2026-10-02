import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { MAIN_CONTENT_ID } from "./skip-link";

/** The single <main> landmark of every page; target of the skip-to-content link. */
export function MainContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main id={MAIN_CONTENT_ID} tabIndex={-1} className={cn("flex-1 focus:outline-none", className)}>
      {children}
    </main>
  );
}
