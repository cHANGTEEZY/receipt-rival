import { createContext, type ComponentProps, useContext } from "react";
import { StyleSheet, View } from "react-native";
import { useCSSVariable } from "uniwind";

import { HugeiconsIcon } from "@hugeicons/react-native";

import { ACCENT_HEX } from "@/theme/accent";

import { Typography } from "heroui-native/text";

type IconData = ComponentProps<typeof HugeiconsIcon>["icon"];

export const SwipeActionSurfaceContext = createContext<string | undefined>(
  undefined,
);

export type SwipeActionTone =
  | "accent"
  | "success"
  | "danger"
  | "warning"
  | "neutral";

const TONE_VARIABLES: Record<
  SwipeActionTone,
  { background: string; foreground: string }
> = {
  accent: {
    background: "--color-accent",
    foreground: "--color-accent-foreground",
  },
  success: {
    background: "--color-success",
    foreground: "--color-success-foreground",
  },
  danger: {
    background: "--color-danger",
    foreground: "--color-danger-foreground",
  },
  warning: {
    background: "--color-warning",
    foreground: "--color-warning-foreground",
  },
  neutral: {
    background: "--color-muted",
    foreground: "--color-accent-foreground",
  },
};

const TONE_FALLBACKS: Record<
  SwipeActionTone,
  { background: string; foreground: string }
> = {
  accent: { background: ACCENT_HEX, foreground: "#FFFFFF" },
  success: { background: "#22C55E", foreground: "#FFFFFF" },
  danger: { background: "#EF4444", foreground: "#FFFFFF" },
  warning: { background: "#F59E0B", foreground: "#1A1A1F" },
  neutral: { background: "#6E6E76", foreground: "#FFFFFF" },
};

export function useSwipeActionTone(tone: SwipeActionTone) {
  const backgroundToken = useCSSVariable(TONE_VARIABLES[tone].background);
  const foregroundToken = useCSSVariable(TONE_VARIABLES[tone].foreground);

  return {
    backgroundColor:
      typeof backgroundToken === "string"
        ? backgroundToken
        : TONE_FALLBACKS[tone].background,
    foregroundColor:
      typeof foregroundToken === "string"
        ? foregroundToken
        : TONE_FALLBACKS[tone].foreground,
  };
}

export function SwipeActionContent({
  icon,
  label,
  color,
}: {
  icon: IconData;
  label: string;
  color: string;
}) {
  const backgroundColor = useContext(SwipeActionSurfaceContext);
  const foreground = useCSSVariable("--color-foreground");
  const labelColor =
    typeof foreground === "string" ? foreground : "rgba(127, 127, 127, 0.95)";

  return (
    <View style={styles.content}>
      <View style={[styles.capsule, { backgroundColor }]}>
        <HugeiconsIcon icon={icon} size={22} color={color} strokeWidth={1.9} />
      </View>
      <Typography
        type="body-xs"
        weight="semibold"
        numberOfLines={1}
        style={{ color: labelColor }}
      >
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  capsule: {
    alignItems: "center",
    alignSelf: "stretch",
    borderCurve: "continuous",
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    alignSelf: "stretch",
    gap: 3,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
});
