import { View } from "react-native";
import { useCSSVariable } from "uniwind";

import HapticPressable from "@/components/HapticButton";
import { useAppColorScheme } from "@/hooks/use-app-color-scheme";

import { FieldError } from "heroui-native/field-error";
import { Typography } from "heroui-native/text";

import { SPLIT_METHODS, type SplitMethod } from "../data/split-form";
import {
  CustomSplitGlyph,
  EqualSplitGlyph,
  ItemizedSplitGlyph,
  PercentageSplitGlyph,
} from "./split-method-glyphs";

const GLYPH_SIZE = 24;

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

function MethodGlyph({
  method,
  color,
}: {
  method: SplitMethod;
  color: string;
}) {
  const props = { color, size: GLYPH_SIZE };

  switch (method) {
    case "equal":
      return <EqualSplitGlyph {...props} />;
    case "itemized":
      return <ItemizedSplitGlyph {...props} />;
    case "percentage":
      return <PercentageSplitGlyph {...props} />;
    case "custom":
      return <CustomSplitGlyph {...props} />;
  }
}

type SplitMethodFieldProps = {
  value: SplitMethod;
  onChange: (method: SplitMethod) => void;
  error?: string | null;
};

export function SplitMethodField({
  value,
  onChange,
  error,
}: SplitMethodFieldProps) {
  const scheme = useAppColorScheme();
  const foreground = useCSSVariable("--color-foreground");
  const muted = useCSSVariable("--color-muted");
  const border = useCSSVariable("--color-border");

  const selectedColor =
    typeof foreground === "string" ? foreground : FOREGROUND_FALLBACK[scheme];
  const idleColor = typeof muted === "string" ? muted : MUTED_FALLBACK[scheme];
  const idleBorder =
    typeof border === "string" ? border : BORDER_FALLBACK[scheme];

  const rows = [SPLIT_METHODS.slice(0, 2), SPLIT_METHODS.slice(2, 4)];

  return (
    <View className="gap-2">
      <Typography type="body-sm" weight="semibold" className="text-foreground">
        Split method
      </Typography>

      <View className="gap-2.5">
        {rows.map((row) => (
          <View
            key={row.map((method) => method.value).join("-")}
            className="flex-row gap-2.5"
          >
            {row.map((method) => {
              const isSelected = value === method.value;
              const accent = isSelected ? selectedColor : idleColor;

              return (
                <HapticPressable
                  key={method.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${method.label}. ${method.description}`}
                  haptic={
                    isSelected
                      ? { type: "none" }
                      : { type: "pulsar", effect: "selection" }
                  }
                  hapticTrigger="onPressIn"
                  onPress={() => {
                    if (isSelected) return;
                    onChange(method.value);
                  }}
                  className="min-h-22 flex-1 items-start justify-between rounded-xl px-3 py-3"
                  style={{
                    borderCurve: "continuous",
                    borderWidth: isSelected ? 1.5 : 1,
                    borderColor: isSelected ? selectedColor : idleBorder,
                  }}
                >
                  <View className="w-full flex-row items-start gap-2">
                    <MethodGlyph method={method.value} color={accent} />
                    <Typography
                      type="body-xs"
                      numberOfLines={2}
                      className="flex-1 text-right"
                      style={{ color: accent, opacity: 0.72 }}
                    >
                      {method.description}
                    </Typography>
                  </View>
                  <Typography
                    type="body-sm"
                    weight="semibold"
                    style={{ color: accent }}
                  >
                    {method.label}
                  </Typography>
                </HapticPressable>
              );
            })}
          </View>
        ))}
      </View>

      {error ? <FieldError>{error}</FieldError> : null}
    </View>
  );
}
