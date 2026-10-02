import { MainContent } from "@/components/layout/main-content";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function PublicLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <>
      <SiteHeader />
      <MainContent className="px-4 py-10">{children}</MainContent>
      <SiteFooter />
    </>
  );
}
