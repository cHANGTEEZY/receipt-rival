import { useSession } from "@/lib/auth-client";

/**
 * Thin wrapper around Better Auth `useSession` for consistent imports from `@/api`.
 */
export function useAuthSession() {
  return useSession();
}

export { useSession };
