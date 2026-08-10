import { UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { router } from "expo-router";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";

import { hapticPress } from "@/lib/haptics";

import { Button } from "heroui-native/button";
import { Typography } from "heroui-native/text";

export default function EmptyFriendComponent() {
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
          icon={UserGroupIcon}
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
          No friend fugitives yet
        </Typography>
        <Typography type="body-sm" color="muted" className="text-center">
          Your list is looking suspiciously peaceful. No one to chase for their
          share, no one to split fries with, no one to drag into your next
          receipt heist.
        </Typography>
        <Typography type="body-sm" color="muted" className="text-center">
          Add some friends before the silence gets awkward.
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
        <Button.Label>Recruit some friends</Button.Label>
      </Button>
    </View>
  );
}
