import { UserAdd01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { router } from "expo-router";
import { useCSSVariable } from "uniwind";

import HapticPressable from "@/components/HapticButton";

export function AddFriendHeaderButton() {
  const foreground = useCSSVariable("--color-foreground");
  const iconColor = typeof foreground === "string" ? foreground : "#1A1A1F";

  return (
    <HapticPressable
      accessibilityLabel="Add friends"
      accessibilityRole="button"
      haptic={{ type: "selection" }}
      hitSlop={8}
      onPress={() => router.push("/(screens)/add-or-find-friends")}
      className="h-10 w-10 items-center justify-center rounded-full"
      style={{ borderCurve: "continuous" }}
    >
      <HugeiconsIcon
        icon={UserAdd01Icon}
        size={20}
        color={iconColor}
        strokeWidth={1.75}
      />
    </HapticPressable>
  );
}
