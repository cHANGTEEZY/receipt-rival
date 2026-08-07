import { Uniwind } from "uniwind";

export type AppearancePreference = "system" | "light" | "dark";

export function getAppearanceLabel(preference: AppearancePreference): string {
  switch (preference) {
    case "light":
      return "Light";
    case "dark":
      return "Dark";
    default:
      return "System";
  }
}

export function setAppearance(preference: AppearancePreference): void {
  Uniwind.setTheme(preference);
}

export function resolveAppearancePreference(
  theme: string | undefined,
  hasAdaptiveThemes: boolean,
): AppearancePreference {
  if (hasAdaptiveThemes) {
    return "system";
  }
  if (theme === "light" || theme === "dark") {
    return theme;
  }
  return "system";
}
