"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { TextField } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Link } from "@/i18n/navigation";

import { AuthError, changePassword, requestPasswordReset, resetPassword } from "../api";
import {
  changePasswordSchema,
  type ChangePasswordValues,
  forgotPasswordSchema,
  type ForgotPasswordValues,
  resetPasswordSchema,
  type ResetPasswordValues,
} from "../schemas";

function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
    >
      {message}
    </p>
  );
}

export function ForgotPasswordForm() {
  const t = useTranslations("auth.password");
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setServerError(null);
    try {
      await requestPasswordReset(values.email);
      setSent(true);
    } catch (error) {
      setServerError(error instanceof AuthError ? error.message : t("error"));
    }
  }

  if (sent) {
    return (
      <p role="status" className="rounded-lg border bg-muted/50 p-4">
        {t("resetSent")}
      </p>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <ErrorBox message={serverError} />
        <TextField control={form.control} name="email" label={t("email")} type="email" autoComplete="email" />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {t("sendLink")}
        </Button>
      </form>
    </Form>
  );
}

export function ResetPasswordForm({ resetKey }: { resetKey: string | null }) {
  const t = useTranslations("auth.password");
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", passwordConfirm: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    if (!resetKey) return;
    setServerError(null);
    try {
      await resetPassword(resetKey, values.password);
      setDone(true);
    } catch (error) {
      if (error instanceof AuthError && error.param === "password") {
        form.setError("password", { message: error.message });
      } else {
        setServerError(error instanceof AuthError ? error.message : t("error"));
      }
    }
  }

  if (!resetKey) return <ErrorBox message={t("invalidLink")} />;

  if (done) {
    return (
      <div role="status" className="flex flex-col items-start gap-3 rounded-lg border bg-muted/50 p-4">
        <p>{t("resetDone")}</p>
        <Button asChild>
          <Link href="/login">{t("toLogin")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <ErrorBox message={serverError} />
        <TextField
          control={form.control}
          name="password"
          label={t("newPassword")}
          type="password"
          autoComplete="new-password"
        />
        <TextField
          control={form.control}
          name="passwordConfirm"
          label={t("passwordConfirm")}
          type="password"
          autoComplete="new-password"
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {t("setPassword")}
        </Button>
      </form>
    </Form>
  );
}

export function ChangePasswordForm() {
  const t = useTranslations("auth.password");
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", password: "", passwordConfirm: "" },
  });

  async function onSubmit(values: ChangePasswordValues) {
    setServerError(null);
    try {
      await changePassword(values.currentPassword, values.password);
      form.reset();
      toast.success(t("changed"));
    } catch (error) {
      if (error instanceof AuthError && error.param === "current_password") {
        form.setError("currentPassword", { message: error.message });
      } else if (error instanceof AuthError && error.param === "new_password") {
        form.setError("password", { message: error.message });
      } else {
        setServerError(error instanceof AuthError ? error.message : t("error"));
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex max-w-sm flex-col gap-4">
        <ErrorBox message={serverError} />
        <TextField
          control={form.control}
          name="currentPassword"
          label={t("currentPassword")}
          type="password"
          autoComplete="current-password"
        />
        <TextField
          control={form.control}
          name="password"
          label={t("newPassword")}
          type="password"
          autoComplete="new-password"
        />
        <TextField
          control={form.control}
          name="passwordConfirm"
          label={t("passwordConfirm")}
          type="password"
          autoComplete="new-password"
        />
        <Button type="submit" className="self-start" disabled={form.formState.isSubmitting}>
          {t("change")}
        </Button>
      </form>
    </Form>
  );
}
