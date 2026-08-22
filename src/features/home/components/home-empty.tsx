import {
  AddInvoiceIcon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { router } from "expo-router";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";

import { ACCENT_HEX } from "@/theme/accent";
import { hapticPress } from "@/lib/haptics";

import { Button } from "heroui-native/button";
import { Typography } from "heroui-native/text";

export function HomeEmpty() {
  const accent = useCSSVariable("--color-accent");
  const iconColor = typeof accent === "string" ? accent : ACCENT_HEX;

  const startSplit = () => {
    hapticPress();
    router.push("/(screens)/split");
  };

  const addFriend = () => {
    hapticPress();
    router.push("/(screens)/add-or-find-friends");
  };

  return (
    <View className="items-center gap-6 px-4 py-12">
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

      <View className="w-full gap-2">
        <Button
          variant="primary"
          size="lg"
          className="rounded-full"
          onPress={startSplit}
        >
          <Button.Label>Create your first split</Button.Label>
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="rounded-full"
          onPress={addFriend}
        >
          <View className="flex-row items-center gap-1.5">
            <HugeiconsIcon
              icon={UserAdd01Icon}
              size={16}
              color={iconColor}
              strokeWidth={1.75}
            />
            <Button.Label>Add friends first</Button.Label>
          </View>
        </Button>
      </View>

      <View className="flex-row items-center gap-4 pt-2">
        {[
          "Snap the receipt",
          "Pick who's in",
          "We keep score",
        ].map((step) => (
          <View key={step} className="items-center gap-1">
            <View className="size-1.5 rounded-full bg-accent/60" />
            <Typography type="body-xs" color="muted">
              {step}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
}
