/** Error envelope returned by the Django API: `{"error": {status, code, detail, fields}}`. */
type ErrorEnvelope = {
  error?: { status?: number; code?: string; detail?: string; fields?: Record<string, unknown> | null };
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code = "error",
    readonly fields: Record<string, string[]> | null = null,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** First message for each field, e.g. `{max_age: "Must be ≥ min_age."}`. */
  fieldMessages(): Record<string, string> {
    return Object.fromEntries(
      Object.entries(this.fields ?? {}).map(([field, messages]) => [field, messages[0] ?? ""]),
    );
  }
}

function normalizeFields(
  fields: Record<string, unknown> | null | undefined,
): Record<string, string[]> | null {
  if (!fields) return null;
  return Object.fromEntries(
    Object.entries(fields).map(([field, value]) => [
      field,
      Array.isArray(value)
        ? value.map(String)
        : typeof value === "object" && value !== null
          ? Object.values(value).flat().map(String)
          : [String(value)],
    ]),
  );
}

export function toApiError(error: unknown, response: Response): ApiError {
  const body = (error ?? {}) as ErrorEnvelope;
  const status = body.error?.status ?? response.status;
  const detail = body.error?.detail || response.statusText || "Request failed";
  return new ApiError(status, detail, body.error?.code, normalizeFields(body.error?.fields));
}

/**
 * Unwraps an openapi-fetch result: returns `data` or throws an `ApiError`.
 * Lets TanStack Query treat failed requests as errors.
 */
export async function unwrap<T>(
  promise: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  const { data, error, response } = await promise;
  if (!response.ok) throw toApiError(error, response);
  return data as T;
}

/** User-facing message for any thrown value. */
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const fieldMessage = Object.values(error.fieldMessages())[0];
    return fieldMessage && error.code === "invalid" ? fieldMessage : error.message;
  }
  return fallback;
}
