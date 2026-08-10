import { type ReactNode } from "react";
import { View } from "react-native";

import { Typography } from "heroui-native/text";

import { UserAvatar } from "./UserAvatar";

type FriendListItemProps = {
  name: string;
  subtitle?: string;
  image?: string | null;
  trailing?: ReactNode;
};

export function FriendListItem({
  name,
  subtitle,
  image,
  trailing,
}: FriendListItemProps) {
  return (
    <View
      className="flex-row items-center gap-3 rounded-3xl bg-surface px-3 py-3"
      style={{ borderCurve: "continuous" }}
    >
      <UserAvatar name={name} image={image} />

      <View className="min-w-0 flex-1 gap-0.5">
        <Typography type="body-sm" weight="semibold" numberOfLines={1}>
          {name}
        </Typography>
        {subtitle ? (
          <Typography type="body-sm" color="muted" numberOfLines={1}>
            {subtitle}
          </Typography>
        ) : null}
      </View>

      {trailing ? <View className="shrink-0">{trailing}</View> : null}
    </View>
  );
}
