"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

import { AuthError, verifyEmail } from "../api";
import { useAfterLogin } from "../hooks/use-after-login";

export function VerifyEmail({ verificationKey }: { verificationKey: string | null }) {
  const t = useTranslations("auth.verifyEmail");
  const afterLogin = useAfterLogin();
  const started = useRef(false);

  const mutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: async (result) => {
      if (result.status === "ok") await afterLogin();
    },
  });

  useEffect(() => {
    // Keys are single-use: guard against React strict-mode double effects.
    if (!verificationKey || started.current) return;
    started.current = true;
    mutation.mutate(verificationKey);
  }, [verificationKey, mutation]);

  if (!verificationKey || mutation.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border p-6">
        <XCircle className="size-6 text-destructive" aria-hidden />
        <p>{mutation.error instanceof AuthError ? mutation.error.message : t("invalid")}</p>
        <Button asChild variant="outline">
          <Link href="/login">{t("toLogin")}</Link>
        </Button>
      </div>
    );
  }

  if (mutation.isSuccess) {
    return (
      <div role="status" className="flex flex-col items-start gap-3 rounded-lg border p-6">
        <CheckCircle2 className="size-6 text-primary" aria-hidden />
        <p>{t("success")}</p>
        <Button asChild>
          <Link href="/login">{t("toLogin")}</Link>
        </Button>
      </div>
    );
  }

  return <LoadingState label={t("verifying")} />;
}
