import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-6 text-sm sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} {t("rights")}
        </p>
        <p>{t("tagline")}</p>
      </div>
    </footer>
  );
}
