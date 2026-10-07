import { initLocale, pageMetadata } from "@/components/layout/page";
import { QuestionnaireFill } from "@/features/questionnaires/components/questionnaire-fill";

export const generateMetadata = pageMetadata("participantQuestionnaireDetail");

export default async function Route({ params }: PageProps<"/[locale]/participant/questionnaires/[id]">) {
  await initLocale(params);
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-5xl">
      <QuestionnaireFill id={id} />
    </div>
  );
}
