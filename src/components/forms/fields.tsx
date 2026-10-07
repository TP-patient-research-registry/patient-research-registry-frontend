"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps, ReactNode } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * Translates a form error: Zod messages are keys in the "validation" namespace,
 * server-side messages (set via `form.setError`) are shown as they are.
 */
export function useValidationMessage() {
  const t = useTranslations("validation");
  return (message: string | undefined) => {
    if (!message) return undefined;
    return t.has(message) ? t(message) : message;
  };
}

type FieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: ReactNode;
  description?: ReactNode;
};

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  ...inputProps
}: FieldProps<T> & Omit<ComponentProps<typeof Input>, "name">) {
  const message = useValidationMessage();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...inputProps} {...field} value={field.value ?? ""} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage>{message(fieldState.error?.message)}</FormMessage>
        </FormItem>
      )}
    />
  );
}

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  ...textareaProps
}: FieldProps<T> & Omit<ComponentProps<typeof Textarea>, "name">) {
  const message = useValidationMessage();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea {...textareaProps} {...field} value={field.value ?? ""} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage>{message(fieldState.error?.message)}</FormMessage>
        </FormItem>
      )}
    />
  );
}

/** Copies `{field: message}` errors from the API onto the form; returns false if none matched. */
export function applyServerErrors<T extends FieldValues>(
  setError: (name: FieldPath<T>, error: { message: string }) => void,
  fields: Record<string, string>,
  known: readonly string[],
): boolean {
  let applied = false;
  for (const [field, message] of Object.entries(fields)) {
    if (known.includes(field)) {
      setError(field as FieldPath<T>, { message });
      applied = true;
    }
  }
  return applied;
}
