import { isAxiosError } from "axios";

export class ApiError extends Error {
  readonly status?: number;
  readonly data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function readApiErrorMessage(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) return undefined;

  if (
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }

  if (
    "error" in data &&
    typeof (data as { error: unknown }).error === "object" &&
    (data as { error: unknown }).error !== null
  ) {
    const nested = (data as { error: { message?: unknown } }).error;
    if (typeof nested.message === "string") {
      return nested.message;
    }
  }

  return undefined;
}

export function normalizeAxiosError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    const message =
      readApiErrorMessage(data) || error.message || "Request failed";

    return new ApiError(message, status, data);
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError("Unknown error");
}

/** Recursively extract a human-readable message from TanStack Form / Zod errors. */
function extractErrorMessage(error: unknown): string | undefined {
  if (error == null) return undefined;
  if (typeof error === "string") return error;
  if (Array.isArray(error)) {
    for (const item of error) {
      const message = extractErrorMessage(item);
      if (message) return message;
    }
    return undefined;
  }
  if (typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
    if (
      "issues" in error &&
      Array.isArray((error as { issues: unknown[] }).issues)
    ) {
      return extractErrorMessage((error as { issues: unknown[] }).issues);
    }
  }
  return undefined;
}

/** Normalize TanStack Form / Standard Schema field errors to a display string. */
export function getFieldError(errors: unknown[]): string | undefined {
  return extractErrorMessage(errors);
}

type FieldMetaLike = {
  errors?: unknown[];
};

type FormErrorsLike = {
  form?: { errors?: unknown[] };
  fields?: Record<string, FieldMetaLike | undefined>;
};

/** Collect all user-facing validation messages from a TanStack Form instance. */
export function collectValidationMessages(formApi: {
  getAllErrors: () => FormErrorsLike;
}): string[] {
  const { form, fields } = formApi.getAllErrors();
  const messages = new Set<string>();

  const formMessage = extractErrorMessage(form?.errors ?? []);
  if (formMessage) messages.add(formMessage);

  for (const field of Object.values(fields ?? {})) {
    const message = extractErrorMessage(field?.errors ?? []);
    if (message) messages.add(message);
  }

  return [...messages];
}

/** Resolve a field error, including nested paths like `items[0].name`. */
export function getFieldDisplayError(
  fieldName: string,
  fieldErrors: unknown[],
  fieldMeta: Record<string, FieldMetaLike | undefined> | undefined,
): string | undefined {
  const direct = getFieldError(fieldErrors);
  if (direct) return direct;

  if (!fieldMeta) return undefined;

  for (const [path, meta] of Object.entries(fieldMeta)) {
    if (path === fieldName || path.startsWith(`${fieldName}[`) || path.startsWith(`${fieldName}.`)) {
      const nested = getFieldError(meta?.errors ?? []);
      if (nested) return nested;
    }
  }

  return undefined;
}

/** Merge TanStack field errors with wizard step errors (step errors take priority). */
export function resolveFieldError(
  fieldName: string,
  fieldErrors: unknown[],
  fieldMeta: Record<string, FieldMetaLike | undefined> | undefined,
  stepFieldErrors?: Record<string, string>,
): string | undefined {
  const stepError = stepFieldErrors?.[fieldName];
  if (stepError) return stepError;

  return getFieldDisplayError(fieldName, fieldErrors, fieldMeta);
}

/** Whether a field (or any of its nested paths, e.g. `items[0].name`) has a validation error. */
export function fieldHasError(
  fieldName: string,
  fieldMeta: Record<string, FieldMetaLike | undefined> | undefined,
): boolean {
  if (!fieldMeta) return false;

  for (const [path, meta] of Object.entries(fieldMeta)) {
    if (
      path === fieldName ||
      path.startsWith(`${fieldName}[`) ||
      path.startsWith(`${fieldName}.`)
    ) {
      if (getFieldError(meta?.errors ?? [])) return true;
    }
  }

  return false;
}

/** Given ordered groups of field names (e.g. one group per wizard step), find the index of the first group containing an error. Returns -1 if none do. */
export function getFirstErroredGroupIndex(
  fieldGroups: string[][],
  fieldMeta: Record<string, FieldMetaLike | undefined> | undefined,
): number {
  return fieldGroups.findIndex((fields) =>
    fields.some((fieldName) => fieldHasError(fieldName, fieldMeta)),
  );
}

export type ItemRowErrors = {
  name?: string;
  unitPriceCents?: string;
  quantity?: string;
};

/** Map nested `items[n].*` validation errors onto item rows. */
export function getItemRowErrors(
  fieldMeta: Record<string, FieldMetaLike | undefined> | undefined,
): Record<number, ItemRowErrors> {
  if (!fieldMeta) return {};

  const rowErrors: Record<number, ItemRowErrors> = {};
  const rowPattern = /^items\[(\d+)\]\.(\w+)$/;

  for (const [path, meta] of Object.entries(fieldMeta)) {
    const match = rowPattern.exec(path);
    if (!match) continue;

    const index = Number(match[1]);
    const key = match[2] as keyof ItemRowErrors;
    const message = getFieldError(meta?.errors ?? []);
    if (!message) continue;

    rowErrors[index] ??= {};
    rowErrors[index][key] = message;
  }

  return rowErrors;
}
