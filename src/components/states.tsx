"use client";

import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/errors";

export function LoadingState({ label }: { label?: string }) {
  const t = useTranslations("common");
  return (
    <div role="status" className="flex items-center gap-2 py-8 text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      <span>{label ?? t("loading")}</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const t = useTranslations("common");
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
    >
      <p className="flex items-center gap-2 font-medium text-destructive">
        <AlertCircle className="size-4" aria-hidden />
        {errorMessage(error, t("genericError"))}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
      <Inbox className="size-6 text-muted-foreground" aria-hidden />
      <p className="font-medium">{title}</p>
      {children && <div className="text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}
