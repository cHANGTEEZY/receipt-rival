import { hapticSelection } from "@/lib/haptics";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { router } from "expo-router";
import { Pressable } from "react-native";
import { useCSSVariable } from "uniwind";

export default function GoBackButton() {
  const foreground = useCSSVariable("--color-foreground");
  const iconColor = typeof foreground === "string" ? foreground : "#ffffff";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={8}
      onPress={() => {
        if (router.canGoBack()) {
          hapticSelection();
          router.back();
        } else {
          hapticSelection();
          router.replace("/(app)/home");
        }
      }}
      className="h-10 w-10 items-center justify-center rounded-full"
      style={{ borderCurve: "continuous" }}
    >
      <HugeiconsIcon
        icon={ArrowLeft01Icon}
        size={20}
        color={iconColor}
        strokeWidth={1.75}
      />
    </Pressable>
  );
}
