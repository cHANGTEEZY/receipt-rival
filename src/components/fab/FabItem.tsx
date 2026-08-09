import { HugeiconsIcon } from "@hugeicons/react-native";
import { View } from "react-native";
import { EaseView } from "react-native-ease/uniwind";
import { useCSSVariable } from "uniwind";

import HapticPressable from "@/components/HapticButton";

import { Typography } from "heroui-native/text";

import { FAB_ITEM_SIZE, FAB_OPEN_TRANSITION, FAB_STAGGER_MS } from "./constants";
import { useFabContext } from "./FabContext";
import type { IconData } from "./types";

export type FabItemProps = {
  /** Hugeicons icon data — see `@hugeicons/core-free-icons`. */
  icon: IconData;
  /** Optional label pill shown on the inner side of the icon. */
  label?: string;
  onPress: () => void;
  testID?: string;
};

/**
 * Internal props injected by `<Fab>` when cloning its children, so each item
 * knows its stack position without the consumer having to pass one.
 */
export type InternalFabItemProps = FabItemProps & {
  __index?: number;
  __count?: number;
};

export function FabItem({
  icon,
  label,
  onPress,
  testID,
  __index = 0,
  __count = 1,
}: InternalFabItemProps) {
  const { open, position, closeMenu } = useFabContext();
  const isRight = position.endsWith("right");
  const surfaceForeground = useCSSVariable("--color-surface-foreground");
  const iconColor =
    typeof surfaceForeground === "string" ? surfaceForeground : "#8a8a8f";

  const delay = open
    ? __index * FAB_STAGGER_MS
    : (__count - 1 - __index) * FAB_STAGGER_MS;

  const handlePress = () => {
    onPress();
    closeMenu();
  };

  return (
    <EaseView
      pointerEvents={open ? "auto" : "none"}
      style={{
        flexDirection: isRight ? "row-reverse" : "row",
        alignItems: "center",
        gap: 10,
      }}
      initialAnimate={{ opacity: 0, scale: 0.6, translateY: 10 }}
      animate={{
        opacity: open ? 1 : 0,
        scale: open ? 1 : 0.6,
        translateY: open ? 0 : 10,
      }}
      transition={{ ...FAB_OPEN_TRANSITION, delay }}
    >
      {label ? (
        <View
          className="rounded-full bg-surface px-3 py-1.5 shadow-surface"
          style={{ borderCurve: "continuous" }}
        >
          <Typography
            type="body-sm"
            weight="medium"
            className="text-foreground"
          >
            {label}
          </Typography>
        </View>
      ) : null}

      <HapticPressable
        accessibilityRole="button"
        accessibilityLabel={label}
        testID={testID}
        haptic={{ type: "selection" }}
        onPress={handlePress}
        className="items-center justify-center rounded-full bg-surface shadow-surface"
        style={{
          width: FAB_ITEM_SIZE,
          height: FAB_ITEM_SIZE,
          borderCurve: "continuous",
        }}
      >
        <HugeiconsIcon
          icon={icon}
          size={22}
          color={iconColor}
          strokeWidth={1.75}
        />
      </HapticPressable>
    </EaseView>
  );
}
