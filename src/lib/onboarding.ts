import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ONBOARDING_COMPLETE_KEY = "onboarding_complete_v1";

export type OnboardingStatus = {
  /** True once we've read the persisted flag (or defaulted it). */
  checked: boolean;
  complete: boolean;
};

let cachedComplete: boolean | null = null;

/** Reads the one-time onboarding flag. Defaults to false when never completed. */
export async function isOnboardingComplete(): Promise<boolean> {
  if (cachedComplete !== null) return cachedComplete;

  try {
    if (Platform.OS === "web") {
      cachedComplete =
        globalThis.localStorage?.getItem(ONBOARDING_COMPLETE_KEY) === "1";
      return cachedComplete;
    }

    const value = await SecureStore.getItemAsync(ONBOARDING_COMPLETE_KEY);
    cachedComplete = value === "1";
    return cachedComplete;
  } catch {
    // Fail open: show onboarding rather than locking someone out.
    return false;
  }
}

/** Persists that the user finished (or skipped) onboarding. Best-effort. */
export async function markOnboardingComplete(): Promise<void> {
  cachedComplete = true;

  try {
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(ONBOARDING_COMPLETE_KEY, "1");
      return;
    }

    await SecureStore.setItemAsync(ONBOARDING_COMPLETE_KEY, "1");
  } catch {
    // Worst case: onboarding shows again next launch.
  }
}
