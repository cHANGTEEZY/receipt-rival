import {
  DarkTheme,
  DefaultTheme,
  type Theme,
} from "expo-router";
import { useMemo } from "react";
import { useCSSVariable } from "uniwind";

import { useAppColorScheme } from "@/hooks/use-app-color-scheme";

export function useScreenBackgroundColor(): string | undefined {
  const backgroundColor = useCSSVariable("--color-background");
  return typeof backgroundColor === "string" ? backgroundColor : undefined;
}

export function useNavigationTheme(): Theme {
  const colorScheme = useAppColorScheme();
  const backgroundColor = useScreenBackgroundColor();

  return useMemo(() => {
    const base = colorScheme === "dark" ? DarkTheme : DefaultTheme;
    const background = backgroundColor ?? base.colors.background;

    return {
      ...base,
      dark: colorScheme === "dark",
      colors: {
        ...base.colors,
        background,
        card: background,
      },
    };
  }, [colorScheme, backgroundColor]);
}

export function useStackContentStyle() {
  const backgroundColor = useScreenBackgroundColor();

  return useMemo(
    () => ({
      flex: 1 as const,
      ...(backgroundColor ? { backgroundColor } : {}),
    }),
    [backgroundColor],
  );
}
