import { View } from "react-native";

import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useRejectFriendRequest,
  useSendFriendRequest,
} from "@/api/hooks/use-friends";
import { hapticPress, hapticSuccess } from "@/lib/haptics";

import { Button } from "heroui-native/button";
import { Chip } from "heroui-native/chip";
import { Spinner } from "heroui-native/spinner";

import type { FriendshipUIStatus } from "../lib/friendship-status";

type FriendshipActionButtonProps = {
  userId: string;
  status: FriendshipUIStatus;
  friendshipId?: string;
  layout?: "compact" | "incoming";
};

export function FriendshipActionButton({
  userId,
  status,
  friendshipId,
  layout = "compact",
}: FriendshipActionButtonProps) {
  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();
  const cancelRequest = useCancelFriendRequest();

  const isSending = sendRequest.isPending && sendRequest.variables === userId;
  const isCancelling =
    cancelRequest.isPending && cancelRequest.variables === friendshipId;
  const isAccepting =
    acceptRequest.isPending && acceptRequest.variables === friendshipId;
  const isRejecting =
    rejectRequest.isPending && rejectRequest.variables === friendshipId;

  if (status === "self") {
    return (
      <Chip size="sm" variant="soft" color="default">
        <Chip.Label>You</Chip.Label>
      </Chip>
    );
  }

  if (status === "friends") {
    return (
      <Chip size="sm" variant="soft" color="success">
        <Chip.Label>Friends</Chip.Label>
      </Chip>
    );
  }

  if (status === "pending_outgoing" && friendshipId) {
    return (
      <Button
        variant="secondary"
        size="sm"
        isDisabled={isCancelling}
        onPress={() => {
          hapticPress();
          cancelRequest.mutate(friendshipId, {
            onSuccess: () => hapticSuccess(),
          });
        }}
      >
        {isCancelling ? (
          <Spinner size="sm" />
        ) : (
          <Button.Label>Cancel request</Button.Label>
        )}
      </Button>
    );
  }

  if (status === "pending_incoming" && friendshipId) {
    if (layout === "incoming") {
      return (
        <View className="flex-row gap-2">
          <Button
            variant="primary"
            size="sm"
            isDisabled={isAccepting || isRejecting}
            onPress={() => {
              hapticPress();
              acceptRequest.mutate(friendshipId, {
                onSuccess: () => hapticSuccess(),
              });
            }}
          >
            {isAccepting ? (
              <Spinner size="sm" color="white" />
            ) : (
              <Button.Label>Accept</Button.Label>
            )}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            isDisabled={isAccepting || isRejecting}
            onPress={() => {
              hapticPress();
              rejectRequest.mutate(friendshipId);
            }}
          >
            {isRejecting ? (
              <Spinner size="sm" />
            ) : (
              <Button.Label>Decline</Button.Label>
            )}
          </Button>
        </View>
      );
    }

    return (
      <View className="flex-row gap-2">
        <Button
          variant="primary"
          size="sm"
          isDisabled={isAccepting || isRejecting}
          onPress={() => {
            hapticPress();
            acceptRequest.mutate(friendshipId, {
              onSuccess: () => hapticSuccess(),
            });
          }}
        >
          {isAccepting ? (
            <Spinner size="sm" color="white" />
          ) : (
            <Button.Label>Accept</Button.Label>
          )}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          isDisabled={isAccepting || isRejecting}
          onPress={() => {
            hapticPress();
            rejectRequest.mutate(friendshipId);
          }}
        >
          {isRejecting ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label>Decline</Button.Label>
          )}
        </Button>
      </View>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      isDisabled={isSending}
      onPress={() => {
        hapticPress();
        sendRequest.mutate(userId, {
          onSuccess: () => hapticSuccess(),
        });
      }}
    >
      {isSending ? (
        <Spinner size="sm" color="white" />
      ) : (
        <Button.Label>Add friend</Button.Label>
      )}
    </Button>
  );
}
