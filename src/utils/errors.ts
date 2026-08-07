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

export function normalizeAxiosError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    const message =
      (typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof (data as { message: unknown }).message === "string" &&
        (data as { message: string }).message) ||
      error.message ||
      "Request failed";

    return new ApiError(message, status, data);
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError("Unknown error");
}

/** Normalize TanStack Form / Standard Schema field errors to a display string. */
export function getFieldError(errors: unknown[]): string | undefined {
  const first = errors[0];
  if (first == null) {
    return undefined;
  }
  if (typeof first === "string") {
    return first;
  }
  if (
    typeof first === "object" &&
    "message" in first &&
    typeof first.message === "string"
  ) {
    return first.message;
  }
  return undefined;
}
