import {
  AddInvoiceIcon,
  Award01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useCSSVariable } from "uniwind";

import { ACCENT_HEX } from "@/theme/accent";
import { hapticPress } from "@/lib/haptics";

import { Typography } from "heroui-native/text";

type QuickAction = {
  key: string;
  label: string;
  icon: typeof AddInvoiceIcon;
  onPress: () => void;
};

export function HomeQuickActions() {
  const accent = useCSSVariable("--color-accent");
  const iconColor = typeof accent === "string" ? accent : ACCENT_HEX;

  const actions: QuickAction[] = [
    {
      key: "split",
      label: "New split",
      icon: AddInvoiceIcon,
      onPress: () => router.push("/(screens)/split"),
    },
    {
      key: "friend",
      label: "Add friend",
      icon: UserAdd01Icon,
      onPress: () => router.push("/(screens)/add-or-find-friends"),
    },
    {
      key: "ranks",
      label: "Ranks",
      icon: Award01Icon,
      onPress: () => router.push("/(app)/ranks"),
    },
  ];

  return (
    <View className="flex-row gap-2">
      {actions.map((action) => (
        <Pressable
          key={action.key}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          className="flex-1 items-center gap-1.5 rounded-3xl bg-surface px-2 py-3.5 active:bg-surface-secondary"
          style={{ borderCurve: "continuous" }}
          onPress={() => {
            hapticPress();
            action.onPress();
          }}
        >
          <HugeiconsIcon
            icon={action.icon}
            size={22}
            color={iconColor}
            strokeWidth={1.75}
          />
          <Typography
            type="body-xs"
            weight="semibold"
            numberOfLines={1}
          >
            {action.label}
          </Typography>
        </Pressable>
      ))}
    </View>
  );
}
