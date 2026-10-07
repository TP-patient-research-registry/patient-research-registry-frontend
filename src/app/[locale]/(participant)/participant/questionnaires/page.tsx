import { initLocale, Page, pageMetadata } from "@/components/layout/page";
import { QuestionnaireList } from "@/features/questionnaires/components/questionnaire-list";

export const generateMetadata = pageMetadata("participantQuestionnaires");

export default async function Route({ params }: PageProps<"/[locale]/participant/questionnaires">) {
  await initLocale(params);
  return (
    <Page pageKey="participantQuestionnaires" width="max-w-3xl">
      <QuestionnaireList />
    </Page>
  );
}
