import { ChevronRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Pressable, View } from "react-native";
import { useCSSVariable } from "uniwind";

import { Typography } from "heroui-native/text";

type SplitSummaryRowProps = {
  label: string;
  value?: string;
  placeholder?: string;
  hasError?: boolean;
  onPress?: () => void;
};

export function SplitSummaryRow({
  label,
  value,
  placeholder,
  hasError,
  onPress,
}: SplitSummaryRowProps) {
  const muted = useCSSVariable("--color-muted");
  const mutedColor = typeof muted === "string" ? muted : "#8a8a8f";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-row items-center justify-between gap-3 rounded-2xl bg-surface-secondary px-4 py-3.5"
      style={{ borderCurve: "continuous" }}
    >
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-1.5">
          <Typography type="body" weight="semibold" className="text-foreground">
            {label}
          </Typography>
          {hasError ? <View className="size-1.5 rounded-full bg-danger" /> : null}
        </View>
        <Typography type="body-sm" color="muted" numberOfLines={1}>
          {value || placeholder || " "}
        </Typography>
      </View>
      <HugeiconsIcon
        icon={ChevronRightIcon}
        size={18}
        color={mutedColor}
        strokeWidth={1.75}
      />
    </Pressable>
  );
}
