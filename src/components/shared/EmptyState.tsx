import { Folder01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";

import { ACCENT_HEX } from "@/theme/accent";
import { hapticPress } from "@/lib/haptics";

import { Button } from "heroui-native/button";
import { Typography } from "heroui-native/text";

type IconData = ComponentProps<typeof HugeiconsIcon>["icon"];

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: IconData;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  title,
  description,
  icon = Folder01Icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const accent = useCSSVariable("--color-accent");
  const iconColor = typeof accent === "string" ? accent : ACCENT_HEX;

  return (
    <View
      className="items-center gap-5 rounded-4xl border border-border bg-surface px-6 py-10"
      style={{ borderCurve: "continuous" }}
    >
      <View
        className="h-16 w-16 items-center justify-center rounded-full bg-accent/10"
        style={{ borderCurve: "continuous" }}
      >
        <HugeiconsIcon
          icon={icon}
          size={32}
          color={iconColor}
          strokeWidth={1.75}
        />
      </View>

      <View className="items-center gap-2">
        <Typography
          type="h5"
          weight="semibold"
          className="text-center text-foreground"
        >
          {title}
        </Typography>
        {description ? (
          <Typography type="body-sm" color="muted" className="text-center">
            {description}
          </Typography>
        ) : null}
      </View>

      {actionLabel && onAction ? (
        <Button
          variant="primary"
          size="md"
          className="w-full"
          onPress={() => {
            hapticPress();
            onAction();
          }}
        >
          <Button.Label>{actionLabel}</Button.Label>
        </Button>
      ) : null}
    </View>
  );
}
