import { Platform } from "react-native";
import { Presets, Settings } from "react-native-pulsar";

let hapticsUnavailableWarned = false;
let hapticsConfigured = false;

function configureHaptics(): void {
  if (Platform.OS === "web" || hapticsConfigured) return;
  hapticsConfigured = true;

  Settings.enableHaptics(true);
  // Pulsar can play synthesized "audio simulation" with presets. Turn it off
  // so feedback stays vibration-only (like expo-haptics / system haptics).
  Settings.enableSound(false);
}

function isHapticsUnavailableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /not available|native module|linked/i.test(message);
}

/** Runs a Pulsar preset. No-op on web; silently skips when the native module is missing. */
export function playPreset(play: () => void): void {
  if (Platform.OS === "web") return;

  configureHaptics();

  try {
    play();
  } catch (error) {
    if (isHapticsUnavailableError(error)) {
      if (__DEV__ && !hapticsUnavailableWarned) {
        hapticsUnavailableWarned = true;
        console.warn(
          "[haptics] Native module missing. Rebuild the app: npx expo run:ios",
        );
      }
      return;
    }

    if (__DEV__) {
      console.warn("[haptics]", error);
    }
  }
}

const APP_PRESET_NAMES = [
  "Propel",
  "Bloom",
  "Flourish",
  "Wobble",
  "Buzz",
  "Blip",
  "Snap",
  "Strike",
  "Pulse",
  "SystemSelection",
] as const;

/** Preload presets used across the app to reduce first-play latency. */
export function preloadAppHaptics(): void {
  if (Platform.OS === "web") return;
  configureHaptics();
  Settings.preloadPresets([...APP_PRESET_NAMES]);
}

/** Form or action submitted — a decisive forward push. */
export function hapticSubmit(): void {
  playPreset(() => Presets.propel());
}

/** Operation succeeded — quiet, non-intrusive confirmation. */
export function hapticSuccess(): void {
  playPreset(() => Presets.bloom());
}

/** Major success — celebration, achievement, or milestone. */
export function hapticSuccessCelebration(): void {
  playPreset(() => Presets.flourish());
}

/** Validation or form error — gentle shake / correction feedback. */
export function hapticError(): void {
  playPreset(() => Presets.wobble());
}

/** Critical failure — hard rejection (access denied, blocked action). */
export function hapticErrorCritical(): void {
  playPreset(() => Presets.buzz());
}

/** Non-blocking warning — heads-up without interrupting the user. */
export function hapticWarning(): void {
  playPreset(() => Presets.blip());
}

/** List, picker, or segmented-control selection. */
export function hapticSelection(): void {
  playPreset(() => Presets.System.selection());
}

/** Toggle or switch snapped into place. */
export function hapticToggle(): void {
  playPreset(() => Presets.snap());
}

/** Primary button or main call-to-action press. */
export function hapticPress(): void {
  playPreset(() => Presets.strike());
}

/** Background activity or loading — steady, non-disruptive pulse. */
export function hapticProcessing(): void {
  playPreset(() => Presets.pulse());
}

/** Platform system haptics for cases where native feel is preferred. */
export const hapticSystem = {
  success: () => playPreset(() => Presets.System.notificationSuccess()),
  warning: () => playPreset(() => Presets.System.notificationWarning()),
  error: () => playPreset(() => Presets.System.notificationError()),
  selection: () => playPreset(() => Presets.System.selection()),
  impactLight: () => playPreset(() => Presets.System.impactLight()),
  impactMedium: () => playPreset(() => Presets.System.impactMedium()),
  impactHeavy: () => playPreset(() => Presets.System.impactHeavy()),
} as const;

/**
 * Semantic app haptics grouped for discoverability.
 *
 * @example
 * ```ts
 * async function handleSubmit() {
 *   hapticSubmit();
 *   try {
 *     await submitForm();
 *     hapticSuccess();
 *   } catch {
 *     hapticError();
 *   }
 * }
 * ```
 */
export const AppHaptics = {
  submit: hapticSubmit,
  success: hapticSuccess,
  successCelebration: hapticSuccessCelebration,
  error: hapticError,
  errorCritical: hapticErrorCritical,
  warning: hapticWarning,
  selection: hapticSelection,
  toggle: hapticToggle,
  press: hapticPress,
  processing: hapticProcessing,
  system: hapticSystem,
  preload: preloadAppHaptics,
} as const;
