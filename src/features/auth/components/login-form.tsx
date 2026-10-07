"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { TextField } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Link } from "@/i18n/navigation";

import { authenticateTotp, AuthError, login } from "../api";
import { useAfterLogin } from "../hooks/use-after-login";
import { loginSchema, type LoginValues, totpSchema, type TotpValues } from "../schemas";

export function LoginForm({ next }: { next?: string | null }) {
  const t = useTranslations("auth.loginForm");
  const [step, setStep] = useState<"credentials" | "totp" | "verifyEmail">("credentials");
  const [serverError, setServerError] = useState<string | null>(null);
  const afterLogin = useAfterLogin();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const totpForm = useForm<TotpValues>({ resolver: zodResolver(totpSchema), defaultValues: { code: "" } });

  async function handle(result: Awaited<ReturnType<typeof login>>) {
    if (result.status === "ok") return afterLogin(next);
    setStep(result.flow === "mfa_authenticate" ? "totp" : "verifyEmail");
  }

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    try {
      await handle(await login(values.email, values.password));
    } catch (error) {
      setServerError(error instanceof AuthError ? error.message : t("error"));
    }
  }

  async function onSubmitTotp(values: TotpValues) {
    setServerError(null);
    try {
      await handle(await authenticateTotp(values.code));
    } catch (error) {
      setServerError(error instanceof AuthError ? error.message : t("error"));
    }
  }

  if (step === "verifyEmail") {
    return (
      <p role="status" className="rounded-lg border bg-muted/50 p-4">
        {t("verifyEmailPending")}
      </p>
    );
  }

  const errorBox = serverError && (
    <p
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
    >
      {serverError}
    </p>
  );

  if (step === "totp") {
    return (
      <Form {...totpForm}>
        <form onSubmit={totpForm.handleSubmit(onSubmitTotp)} noValidate className="flex flex-col gap-4">
          {errorBox}
          <TextField
            control={totpForm.control}
            name="code"
            label={t("totpCode")}
            description={t("totpHelp")}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
          />
          <Button type="submit" disabled={totpForm.formState.isSubmitting}>
            {t("verify")}
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {errorBox}
        <TextField
          control={form.control}
          name="email"
          label={t("email")}
          type="email"
          autoComplete="email"
          required
        />
        <TextField
          control={form.control}
          name="password"
          label={t("password")}
          type="password"
          autoComplete="current-password"
          required
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {t("submit")}
        </Button>
        <div className="flex flex-col gap-1 text-sm">
          <Link href="/forgot-password" className="text-primary underline-offset-4 hover:underline">
            {t("forgotPassword")}
          </Link>
          <p className="text-muted-foreground">
            {t("noAccount")}{" "}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              {t("register")}
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
}
