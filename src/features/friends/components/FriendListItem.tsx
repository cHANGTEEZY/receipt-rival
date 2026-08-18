import { type ReactNode } from "react";
import { Pressable, View } from "react-native";

import { SwipeableRow } from "@/components/SwipeableRow";

import { Typography } from "heroui-native/text";

import { useFriendSwipeActions } from "../hooks/use-friend-swipe-actions";
import type { FriendshipUIStatus } from "../lib/friendship-status";
import { UserAvatar } from "./UserAvatar";

type FriendListItemProps = {
  name: string;
  userId?: string;
  subtitle?: string;
  image?: string | null;
  trailing?: ReactNode;
  onPress?: () => void;
  swipeStatus?: FriendshipUIStatus;
  friendshipId?: string;
  enableSplitAction?: boolean;
};

export function FriendListItem({
  name,
  userId,
  subtitle,
  image,
  trailing,
  onPress,
  swipeStatus,
  friendshipId,
  enableSplitAction,
}: FriendListItemProps) {
  const { disabled, leftActions, rightActions } = useFriendSwipeActions({
    enableSplitAction,
    friendshipId,
    name,
    status: swipeStatus,
    userId,
  });

  const content = (
    <View
      className="flex-row items-center gap-3 rounded-3xl bg-surface px-3 py-3"
      style={{ borderCurve: "continuous" }}
    >
      <UserAvatar name={name} userId={userId} image={image} />

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

  const row = onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  ) : (
    content
  );

  if (leftActions.length === 0 && rightActions.length === 0) {
    return row;
  }

  return (
    <SwipeableRow
      disabled={disabled}
      leftActions={leftActions}
      rightActions={rightActions}
    >
      {row}
    </SwipeableRow>
  );
}
