import { MainContent } from "@/components/layout/main-content";
import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <MainContent className="px-4 py-10">
        <PlaceholderPage pageKey="notFound" />
      </MainContent>
      <SiteFooter />
    </>
  );
}
