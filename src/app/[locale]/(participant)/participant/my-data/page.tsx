import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { MyData } from "@/features/participant/components/my-data";

export const generateMetadata = pageMetadata("participantMyData");

export default async function Route({ params }: PageProps<"/[locale]/participant/my-data">) {
  await initLocale(params);
  return (
    <Page pageKey="participantMyData" width="max-w-5xl">
      <MyData />
    </Page>
  );
}
