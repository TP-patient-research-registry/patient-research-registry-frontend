"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FlaskConical, HeartHandshake, MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { TextField, useValidationMessage } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import { AuthError, signup } from "../api";
import { useAfterLogin } from "../hooks/use-after-login";
import { registerSchema, type RegisterValues } from "../schemas";

const ROLE_OPTIONS = [
  { value: "participant", icon: HeartHandshake },
  { value: "researcher", icon: FlaskConical },
] as const;

export function RegisterForm() {
  const t = useTranslations("auth.registerForm");
  const message = useValidationMessage();
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const afterLogin = useAfterLogin();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", passwordConfirm: "", role: "participant", acceptTerms: false },
  });

  async function onSubmit(values: RegisterValues) {
    setServerError(null);
    try {
      const result = await signup({ email: values.email, password: values.password, role: values.role });
      if (result.status === "ok") return afterLogin();
      setSentTo(values.email);
    } catch (error) {
      if (error instanceof AuthError && (error.param === "email" || error.param === "password")) {
        form.setError(error.param, { message: error.message });
      } else {
        setServerError(error instanceof AuthError ? error.message : t("error"));
      }
    }
  }

  if (sentTo) {
    return (
      <div role="status" className="flex flex-col items-start gap-3 rounded-lg border bg-muted/50 p-6">
        <MailCheck className="size-6 text-primary" aria-hidden />
        <h2 className="text-lg font-semibold">{t("checkEmailTitle")}</h2>
        <p>{t("checkEmail", { email: sentTo })}</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {serverError && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {serverError}
          </p>
        )}

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium">{t("role")}</legend>
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
                {ROLE_OPTIONS.map(({ value, icon: Icon }) => (
                  <label
                    key={value}
                    className={cn(
                      "flex cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                      field.value === value ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                    )}
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={value}
                      checked={field.value === value}
                      onChange={() => field.onChange(value)}
                      className="sr-only"
                    />
                    <span className="flex items-center gap-2 font-medium">
                      <Icon className="size-4 text-primary" aria-hidden />
                      {t(`roles.${value}.label`)}
                    </span>
                    <span className="text-sm text-muted-foreground">{t(`roles.${value}.description`)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        />

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
          description={t("passwordHelp")}
          type="password"
          autoComplete="new-password"
          required
        />
        <TextField
          control={form.control}
          name="passwordConfirm"
          label={t("passwordConfirm")}
          type="password"
          autoComplete="new-password"
          required
        />

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field, fieldState }) => (
            <FormItem>
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                </FormControl>
                <FormLabel className="leading-snug font-normal">{t("acceptTerms")}</FormLabel>
              </div>
              <FormMessage>{message(fieldState.error?.message)}</FormMessage>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {t("submit")}
        </Button>
        <p className="text-sm text-muted-foreground">
          {t("haveAccount")}{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            {t("login")}
          </Link>
        </p>
      </form>
    </Form>
  );
}
