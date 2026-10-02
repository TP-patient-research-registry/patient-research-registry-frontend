import {
  initLocale,
  type LocaleParams,
  PlaceholderPage,
  placeholderMetadata,
} from "@/components/layout/placeholder-page";

export const generateMetadata = placeholderMetadata("participantMyStudies");

export default async function Page({ params }: LocaleParams) {
  await initLocale(params);
  return <PlaceholderPage pageKey="participantMyStudies" />;
}
