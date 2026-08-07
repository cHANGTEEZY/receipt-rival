import { type ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { useCSSVariable, useUniwind } from "uniwind";

import { useAppColorScheme } from "@/hooks/use-app-color-scheme";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Typography } from "heroui-native/text";

import {
  type AppearancePreference,
  resolveAppearancePreference,
  setAppearance,
} from "../lib/appearance";

type IconData = ComponentProps<typeof HugeiconsIcon>["icon"];

const OPTIONS: AppearancePreference[] = ["system", "dark", "light"];

const LABELS: Record<AppearancePreference, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

const BORDER_FALLBACK = {
  light: "#E3E3E6",
  dark: "#444448",
} as const;

const MUTED_FALLBACK = {
  light: "#8E8E93",
  dark: "#AEAEB2",
} as const;

const FOREGROUND_FALLBACK = {
  light: "#1C1C1E",
  dark: "#FFFFFF",
} as const;

function SystemThemeIcon({
  color,
  size = 28,
}: {
  color: string;
  size?: number;
}) {
  const half = size / 2;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 3,
        borderWidth: 1,
        borderColor: color,
        overflow: "hidden",
        flexDirection: "row",
      }}
    >
      <View style={{ width: half, height: size, backgroundColor: color }} />
      <View
        style={{ width: half, height: size, backgroundColor: "transparent" }}
      />
    </View>
  );
}

function ThemeGlyph({
  preference,
  color,
}: {
  preference: AppearancePreference;
  color: string;
}) {
  if (preference === "system") {
    return <SystemThemeIcon color={color} />;
  }

  const icon: IconData = preference === "light" ? Sun03Icon : Moon02Icon;

  return (
    <HugeiconsIcon icon={icon} size={28} color={color} strokeWidth={1.75} />
  );
}

export default function CycleTheme() {
  const scheme = useAppColorScheme();
  const { theme, hasAdaptiveThemes } = useUniwind();
  const selected = resolveAppearancePreference(theme, hasAdaptiveThemes);

  const foreground = useCSSVariable("--color-foreground");
  const muted = useCSSVariable("--color-muted");
  const border = useCSSVariable("--color-border");

  const selectedColor =
    typeof foreground === "string"
      ? foreground
      : FOREGROUND_FALLBACK[scheme];
  const idleColor =
    typeof muted === "string" ? muted : MUTED_FALLBACK[scheme];
  const idleBorder =
    typeof border === "string" ? border : BORDER_FALLBACK[scheme];

  return (
    <View className="mt-5 flex-row gap-3">
      {OPTIONS.map((option) => {
        const isSelected = selected === option;
        const accent = isSelected ? selectedColor : idleColor;

        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${LABELS[option]} color scheme`}
            onPress={() => setAppearance(option)}
            className="min-h-27.5 flex-1 justify-between rounded-xl px-3.5 py-3.5"
            style={{
              borderCurve: "continuous",
              borderWidth: isSelected ? 1.5 : 1,
              borderColor: isSelected ? selectedColor : idleBorder,
            }}
          >
            <ThemeGlyph preference={option} color={accent} />
            <Typography
              type="body-sm"
              weight="semibold"
              style={{ color: accent }}
            >
              {LABELS[option]}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}
