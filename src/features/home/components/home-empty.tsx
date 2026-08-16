import { AddInvoiceIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { router } from "expo-router";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";

import { hapticPress } from "@/lib/haptics";

import { Button } from "heroui-native/button";
import { Typography } from "heroui-native/text";

export function HomeEmpty() {
  const accent = useCSSVariable("--color-accent");
  const iconColor = typeof accent === "string" ? accent : "#3b82f6";

  return (
    <View className="items-center gap-6 px-4 py-16">
      <View className="size-28 items-center justify-center rounded-full bg-accent/12">
        <HugeiconsIcon
          icon={AddInvoiceIcon}
          size={56}
          color={iconColor}
          strokeWidth={1.5}
        />
      </View>

      <View className="items-center gap-2">
        <Typography type="h3" weight="bold" className="text-center">
          Nothing to settle
        </Typography>
        <Typography type="body" color="muted" className="text-center">
          Create a split with friends and we’ll keep score of who owes whom.
        </Typography>
      </View>

      <Button
        variant="primary"
        size="lg"
        className="rounded-full px-8"
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
