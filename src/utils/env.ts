import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

/**
 * Metro / Expo Go host IP (e.g. "192.168.0.172") when running on a device.
 * Used so localhost URLs reach the Mac from a physical phone.
 */
function getDevHostIp(): string | null {
  const candidates: (string | null | undefined)[] = [
    NativeModules.SourceCode?.scriptURL,
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    (
      Constants as {
        manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } };
      }
    ).manifest2?.extra?.expoGo?.debuggerHost,
    (Constants as { manifest?: { debuggerHost?: string } }).manifest
      ?.debuggerHost,
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== "string" || !candidate) continue;

    const host = candidate.includes("://")
      ? candidate.split("://")[1]?.split("/")[0]?.split(":")[0]
      : candidate.split(":")[0];

    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return host;
    }
  }

  return null;
}

/**
 * Rewrite localhost so requests reach the machine running the API server.
 * - Android emulator → 10.0.2.2
 * - Physical device (Expo Go) → Metro host LAN IP
 */
function resolveForPlatform(apiUrl: string): string {
  try {
    const url = new URL(apiUrl);
    const isLoopback =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";

    if (!isLoopback) {
      return url.toString().replace(/\/$/, "");
    }

    if (Platform.OS === "android") {
      const hostIp = getDevHostIp();
      url.hostname = hostIp ?? "10.0.2.2";
      return url.toString().replace(/\/$/, "");
    }

    if (Platform.OS !== "web") {
      const hostIp = getDevHostIp();
      if (hostIp) {
        url.hostname = hostIp;
        return url.toString().replace(/\/$/, "");
      }
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return apiUrl.replace(/\/$/, "");
  }
}

function getDevFallbackApiUrl(): string {
  const hostIp = getDevHostIp();
  if (hostIp) {
    return `http://${hostIp}:3000`;
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }
  return "http://localhost:3000";
}

/**
 * Public API / Better Auth base URL (no trailing slash).
 * Set `EXPO_PUBLIC_API_URL` in `.env` (see `.env.example`).
 */
export function getApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  const fromExtra = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL as
    | string
    | undefined;

  const apiUrl = fromEnv || fromExtra;

  if (!apiUrl) {
    if (__DEV__) {
      const fallback = getDevFallbackApiUrl();
      console.warn(
        `[env] EXPO_PUBLIC_API_URL is not set. Using dev fallback: ${fallback}`,
      );
      return fallback;
    }

    console.warn(
      "[env] EXPO_PUBLIC_API_URL is not set. API and auth requests will fail.",
    );
    return "";
  }

  return resolveForPlatform(apiUrl);
}
