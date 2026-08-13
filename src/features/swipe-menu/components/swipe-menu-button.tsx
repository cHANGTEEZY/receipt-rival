import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useCSSVariable } from "uniwind";

import HapticPressable from "@/components/HapticButton";

import { useOptionalSwipeMenuContext } from "../context";

export function SwipeMenuButton() {
  const swipeMenu = useOptionalSwipeMenuContext();
  const foreground = useCSSVariable("--color-foreground");
  const iconColor = typeof foreground === "string" ? foreground : "#1A1A1F";

  if (!swipeMenu) {
    return null;
  }

  return (
    <HapticPressable
      accessibilityLabel="Open swipe menu"
      accessibilityRole="button"
      haptic={{ type: "selection" }}
      hitSlop={8}
      onPress={swipeMenu.openMenu}
      className="h-10 w-10 items-center justify-center rounded-full"
      style={{ borderCurve: "continuous" }}
    >
      <HugeiconsIcon
        icon={Menu01Icon}
        size={20}
        color={iconColor}
        strokeWidth={1.75}
      />
    </HapticPressable>
  );
}
