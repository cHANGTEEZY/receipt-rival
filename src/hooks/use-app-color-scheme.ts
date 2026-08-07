import { useColorScheme } from "react-native";
import { Uniwind, useUniwind } from "uniwind";

/**
 * Resolved light/dark appearance for the app.
 * Uses the locked Uniwind theme when set; otherwise follows the system scheme.
 */
export function useAppColorScheme(): "light" | "dark" {
  const systemScheme = useColorScheme();
  const { theme, hasAdaptiveThemes } = useUniwind();

  if (!hasAdaptiveThemes && (theme === "light" || theme === "dark")) {
    return theme;
  }

  return systemScheme === "dark" ? "dark" : "light";
}

export function useToggleAppTheme() {
  const isDark = useAppColorScheme() === "dark";

  return () => {
    Uniwind.setTheme(isDark ? "light" : "dark");
  };
}
