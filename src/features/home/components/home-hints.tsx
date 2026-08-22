import { AddInvoiceIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useCSSVariable } from "uniwind";

import { ACCENT_HEX } from "@/theme/accent";
import { hapticPress } from "@/lib/haptics";

import { Typography } from "heroui-native/text";

/** Slim hint shown when balances exist but there are no receipts yet. */
export function HomeNoReceiptsHint() {
  const accent = useCSSVariable("--color-accent");
  const iconColor = typeof accent === "string" ? accent : ACCENT_HEX;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Create a split"
      onPress={() => {
        hapticPress();
        router.push("/(screens)/split");
      }}
    >
      <View
        className="flex-row items-center gap-3 rounded-3xl border border-dashed border-border bg-surface/60 px-4 py-3.5"
        style={{ borderCurve: "continuous" }}
      >
        <View className="size-10 items-center justify-center rounded-full bg-accent/10">
          <HugeiconsIcon
            icon={AddInvoiceIcon}
            size={20}
            color={iconColor}
            strokeWidth={1.75}
          />
        </View>
        <View className="min-w-0 flex-1">
          <Typography type="body-sm" weight="semibold" numberOfLines={1}>
            You have open balances
          </Typography>
          <Typography type="body-xs" color="muted" numberOfLines={1}>
            Add a receipt to start tracking them.
          </Typography>
        </View>
      </View>
    </Pressable>
  );
}

/** Celebration chip when every balance is cleared. */
export function HomeAllSettled() {
  return (
    <View
      className="flex-row items-center justify-center gap-2 rounded-full bg-success/12 px-4 py-2.5"
      style={{ borderCurve: "continuous" }}
    >
      <View className="size-1.5 rounded-full bg-success" />
      <Typography type="body-sm" weight="semibold" className="text-success">
        All settled up — nothing pending
      </Typography>
    </View>
  );
}
