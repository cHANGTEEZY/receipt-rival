import { AddInvoiceIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { router } from "expo-router";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";

import { hapticPress } from "@/lib/haptics";

import { Button } from "heroui-native/button";
import { Typography } from "heroui-native/text";

export function SplitListEmpty() {
  const accent = useCSSVariable("--color-accent");
  const iconColor = typeof accent === "string" ? accent : "#3b82f6";

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
          icon={AddInvoiceIcon}
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
          No splits yet
        </Typography>
        <Typography type="body-sm" color="muted" className="text-center">
          Create a split, add friends, and settle up before someone “forgets”
          their share.
        </Typography>
      </View>

      <Button
        variant="primary"
        size="md"
        className="w-full"
        onPress={() => {
          hapticPress();
          router.push("/(screens)/split");
        }}
      >
        <Button.Label>Create a split</Button.Label>
      </Button>
    </View>
  );
}
