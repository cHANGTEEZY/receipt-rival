import { useCSSVariable } from "uniwind";

import { useAppColorScheme } from "@/hooks/use-app-color-scheme";

import { COLOR_FALLBACKS } from "../constants";
import type { ColorPalette } from "../types";

function cssColor(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

export function useSwipeMenuColors(): ColorPalette {
  const colorScheme = useAppColorScheme();
  const fallbacks = COLOR_FALLBACKS[colorScheme];

  const background = useCSSVariable("--color-background");
  const foreground = useCSSVariable("--color-foreground");
  const surface = useCSSVariable("--color-surface");
  const surfaceSecondary = useCSSVariable("--color-surface-secondary");
  const muted = useCSSVariable("--color-muted");
  const accent = useCSSVariable("--color-accent");
  const accentForeground = useCSSVariable("--color-accent-foreground");
  const separator = useCSSVariable("--color-separator");
  const border = useCSSVariable("--color-border");

  return {
    accent: cssColor(accent, fallbacks.accent),
    accentText: cssColor(accentForeground, fallbacks.accentText),
    menuBackground: cssColor(background, fallbacks.menuBackground),
    menuSelected: cssColor(surfaceSecondary, fallbacks.menuSelected),
    muted: cssColor(muted, fallbacks.muted),
    separator: cssColor(separator, fallbacks.separator),
    surfaceBackground: cssColor(surface, fallbacks.surfaceBackground),
    surfaceBorder: cssColor(border, fallbacks.surfaceBorder),
    text: cssColor(foreground, fallbacks.text),
  };
}
