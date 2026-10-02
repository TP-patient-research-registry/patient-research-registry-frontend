import { notFound } from "next/navigation";

// Catch-all so unknown localized URLs render [locale]/not-found.tsx inside the locale layout.
export default function CatchAll() {
  notFound();
}
