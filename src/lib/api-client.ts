import { create, type AxiosInstance } from "axios";
import { router } from "expo-router";

import { getCookie } from "@/lib/auth-client";
import { getApiUrl } from "@/utils/env";

function serializeParams(params: Record<string, unknown> | undefined): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          searchParams.append(key, String(v));
        }
      }
    } else if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      searchParams.append(key, String(value));
    }
  }
  return searchParams.toString();
}

export function createApiClient(): AxiosInstance {
  const client = create({
    baseURL: getApiUrl(),
    headers: {
      "Content-Type": "application/json",
    },
    // Manual Cookie header from SecureStore — do not let the runtime merge cookies.
    withCredentials: false,
    paramsSerializer: {
      serialize: serializeParams,
    },
  });

  client.interceptors.request.use(
    (config) => {
      const cookies = getCookie();
      if (cookies) {
        config.headers.Cookie = cookies;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Safe to call even if already on an auth screen.
        router.replace("/sign-in");
      }
      return Promise.reject(error);
    },
  );

  return client;
}

/** Shared axios instance for domain API calls. */
export const api = createApiClient();
