import { Alert, View } from "react-native";

import { useRemoveFriend } from "@/api/hooks/use-friends";
import { FriendshipActionButton } from "@/features/friends/components/FriendshipActionButton";
import type { FriendshipUIStatus } from "@/features/friends/lib/friendship-status";
import { hapticError, hapticPress, hapticSuccess } from "@/lib/haptics";

import { Button } from "heroui-native/button";
import { Spinner } from "heroui-native/spinner";
import { Typography } from "heroui-native/text";

type ProfileFriendActionsProps = {
  userId: string;
  name: string;
  status: FriendshipUIStatus;
  friendshipId?: string;
};

export function ProfileFriendActions({
  userId,
  name,
  status,
  friendshipId,
}: ProfileFriendActionsProps) {
  const removeFriend = useRemoveFriend();

  const confirmRemove = () => {
    hapticPress();
    Alert.alert(
      `Remove ${name}?`,
      "You'll need a new request to be friends again.",
      [
        { style: "cancel", text: "Cancel" },
        {
          style: "destructive",
          text: "Remove",
          onPress: () => {
            removeFriend.mutate(userId, {
              onError: () => hapticError(),
              onSuccess: () => hapticSuccess(),
            });
          },
        },
      ],
    );
  };

  return (
    <View className="items-center gap-2">
      <View className="w-full items-center">
        <FriendshipActionButton
          userId={userId}
          status={status}
          friendshipId={friendshipId}
        />
      </View>

      {status === "friends" ? (
        <Button
          variant="ghost"
          size="sm"
          isDisabled={removeFriend.isPending}
          onPress={confirmRemove}
          className="rounded-full"
        >
          {removeFriend.isPending ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label className="text-danger">Remove friend</Button.Label>
          )}
        </Button>
      ) : null}

      {status === "none" ? (
        <Typography type="body-xs" color="muted">
          Not friends yet — send a request to split faster.
        </Typography>
      ) : null}
    </View>
  );
}
