import {
  ClipboardCheck,
  Eye,
  FileLock2,
  FlaskConical,
  HeartHandshake,
  type LucideIcon,
  Search,
  Server,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { initLocale, pageMetadata } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { FeaturedStudies } from "@/features/studies/components/featured-studies";
import { Link } from "@/i18n/navigation";

export const generateMetadata = pageMetadata("landing");

const PARTICIPANT_STEPS: [string, LucideIcon][] = [
  ["register", UserPlus],
  ["profile", UserCheck],
  ["match", Search],
  ["results", Eye],
];
const RESEARCHER_STEPS: [string, LucideIcon][] = [
  ["create", FlaskConical],
  ["recruit", Users],
  ["collect", ClipboardCheck],
  ["share", HeartHandshake],
];
const TRUST: [string, LucideIcon][] = [
  ["encryption", FileLock2],
  ["pseudonyms", ShieldCheck],
  ["consent", UserCheck],
  ["hosting", Server],
];

export default async function LandingPage({ params }: PageProps<"/[locale]">) {
  await initLocale(params);
  const t = await getTranslations("landing");

  const steps = (key: "participants" | "researchers", items: [string, LucideIcon][]) => (
    <ol className="flex flex-col gap-4">
      {items.map(([step, Icon], i) => (
        <li key={step} className="flex gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="size-4" aria-hidden />
          </span>
          <div>
            <h4 className="font-medium">
              <span className="sr-only">{i + 1}. </span>
              {t(`${key}.steps.${step}.title`)}
            </h4>
            <p className="text-sm text-muted-foreground">{t(`${key}.steps.${step}.text`)}</p>
          </div>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-20">
      <section className="grid items-center gap-8 pt-6 md:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-6">
          <p className="w-fit rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {t("eyebrow")}
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{t("lead")}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/register">{t("ctaJoin")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/studies">{t("ctaBrowse")}</Link>
            </Button>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-3" aria-label={t("highlightsLabel")}>
          {(["control", "transparency", "rare", "local"] as const).map((key) => (
            <li key={key} className="rounded-xl border bg-card p-4">
              <p className="font-semibold">{t(`highlights.${key}.title`)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t(`highlights.${key}.text`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how" className="flex flex-col gap-8">
        <h2 id="how" className="font-heading text-3xl font-bold tracking-tight">
          {t("howTitle")}
        </h2>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold">{t("participants.title")}</h3>
            {steps("participants", PARTICIPANT_STEPS)}
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold">{t("researchers.title")}</h3>
            {steps("researchers", RESEARCHER_STEPS)}
          </div>
        </div>
      </section>

      <section aria-labelledby="featured" className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="featured" className="font-heading text-3xl font-bold tracking-tight">
            {t("featuredTitle")}
          </h2>
          <Button asChild variant="ghost">
            <Link href="/studies">{t("allStudies")}</Link>
          </Button>
        </div>
        <FeaturedStudies />
      </section>

      <section aria-labelledby="trust" className="flex flex-col gap-6 rounded-2xl bg-muted/50 p-6 sm:p-10">
        <div className="flex flex-col gap-2">
          <h2 id="trust" className="font-heading text-3xl font-bold tracking-tight">
            {t("trustTitle")}
          </h2>
          <p className="max-w-3xl text-muted-foreground">{t("trustLead")}</p>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2">
          {TRUST.map(([key, Icon]) => (
            <li key={key} className="flex gap-3">
              <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div>
                <h3 className="font-semibold">{t(`trust.${key}.title`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`trust.${key}.text`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
