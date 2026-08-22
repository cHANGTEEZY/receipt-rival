import { Award01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { router } from "expo-router";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";

import { ACCENT_HEX } from "@/theme/accent";
import { hapticPress } from "@/lib/haptics";

import { Button } from "heroui-native/button";
import { Typography } from "heroui-native/text";

export function DeadbeatEmpty() {
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
          icon={Award01Icon}
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
          Nobody to roast yet
        </Typography>
        <Typography type="body-sm" color="muted" className="text-center">
          Add friends or split a receipt and we’ll rank who pays on time — and
          who files emotional damage.
        </Typography>
      </View>

      <Button
        variant="primary"
        size="md"
        className="w-full"
        onPress={() => {
          hapticPress();
          router.push("/(screens)/add-or-find-friends");
        }}
      >
        <Button.Label>Add friends</Button.Label>
      </Button>
    </View>
  );
}
