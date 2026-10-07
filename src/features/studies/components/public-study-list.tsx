"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";

import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { usePublicStudies } from "../api";
import { StudyCard } from "./study-card";

const PAGE_SIZE = 20;

/** Search form + paginated grid of published studies. `hrefFor` decides where cards link to. */
export function PublicStudyList({ hrefFor }: { hrefFor?: (id: string) => string }) {
  const t = useTranslations("studies");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [page, setPage] = useState(1);
  const query = usePublicStudies({ search, page });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSearch(draft.trim());
    setPage(1);
  }

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.count / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <form role="search" onSubmit={onSubmit} className="flex max-w-xl items-end gap-2">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="study-search">{t("search")}</Label>
          <Input
            id="study-search"
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("searchPlaceholder")}
          />
        </div>
        <Button type="submit">
          <Search aria-hidden />
          {t("searchSubmit")}
        </Button>
      </form>

      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.data.results.length === 0 ? (
        <EmptyState title={search ? t("noResults") : t("empty")} />
      ) : (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {t("count", { count: query.data.count })}
          </p>
          <ul className="grid gap-4 md:grid-cols-2">
            {query.data.results.map((study) => (
              <li key={study.id}>
                <StudyCard study={study} href={hrefFor?.(study.id) ?? `/studies/${study.id}`} />
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <nav aria-label={t("pagination")} className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                {t("previous")}
              </Button>
              <span className="text-sm">{t("pageOf", { page, total: totalPages })}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("next")}
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
