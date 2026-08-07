import { type ComponentProps } from "react";
import { View } from "react-native";

import { HugeiconsIcon } from "@hugeicons/react-native";

type IconData = ComponentProps<typeof HugeiconsIcon>["icon"];

type SettingsIconTileProps = {
  icon: IconData;
  backgroundColor: string;
  iconColor?: string;
  size?: number;
};

export function SettingsIconTile({
  icon,
  backgroundColor,
  iconColor = "#FFFFFF",
  size = 32,
}: SettingsIconTileProps) {
  return (
    <View
      className="items-center justify-center rounded-[9px]"
      style={{
        width: size,
        height: size,
        backgroundColor,
        borderCurve: "continuous",
      }}
    >
      <HugeiconsIcon
        icon={icon}
        size={Math.round(size * 0.56)}
        color={iconColor}
        strokeWidth={1.75}
      />
    </View>
  );
}
