import { router } from "expo-router";
import { useMemo } from "react";
import { Alert } from "react-native";

import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useRejectFriendRequest,
  useRemoveFriend,
  useSendFriendRequest,
} from "@/api/hooks/use-friends";
import {
  SwipeActionContent,
  useSwipeActionTone,
} from "@/components/swipe-action-content";
import type { SwipeableRowAction } from "@/components/SwipeableRow";
import {
  hapticError,
  hapticSuccess,
  hapticWarning,
} from "@/lib/haptics";
import {
  AddInvoiceIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";

import type { FriendshipUIStatus } from "../lib/friendship-status";

type UseFriendSwipeActionsParams = {
  enableSplitAction?: boolean;
  friendshipId?: string;
  name: string;
  status?: FriendshipUIStatus;
  userId?: string;
};

export function useFriendSwipeActions({
  enableSplitAction = false,
  friendshipId,
  name,
  status,
  userId,
}: UseFriendSwipeActionsParams): {
  disabled: boolean;
  leftActions: SwipeableRowAction[];
  rightActions: SwipeableRowAction[];
} {
  const accent = useSwipeActionTone("accent");
  const success = useSwipeActionTone("success");
  const danger = useSwipeActionTone("danger");
  const warning = useSwipeActionTone("warning");

  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();
  const cancelRequest = useCancelFriendRequest();
  const removeFriend = useRemoveFriend();

  const isPending =
    (Boolean(userId) && sendRequest.isPending && sendRequest.variables === userId) ||
    (Boolean(friendshipId) &&
      acceptRequest.isPending &&
      acceptRequest.variables === friendshipId) ||
    (Boolean(friendshipId) &&
      rejectRequest.isPending &&
      rejectRequest.variables === friendshipId) ||
    (Boolean(friendshipId) &&
      cancelRequest.isPending &&
      cancelRequest.variables === friendshipId) ||
    (Boolean(userId) &&
      removeFriend.isPending &&
      removeFriend.variables === userId);

  return useMemo(() => {
    const splitAction: SwipeableRowAction | null =
      enableSplitAction && userId && status !== "self"
        ? {
            accessibilityHint: "Opens a new split with this person selected",
            accessibilityLabel: `Create a split with ${name}`,
            backgroundColor: accent.backgroundColor,
            content: (
              <SwipeActionContent
                color={accent.foregroundColor}
                icon={AddInvoiceIcon}
                label="Split"
              />
            ),
            fullSwipe: true,
            key: "split",
            onPress: () => {
              router.push({
                pathname: "/(screens)/split",
                params: { friendId: userId },
              });
            },
            width: 84,
          }
        : null;

    if (!userId || status === "self") {
      return { disabled: false, leftActions: [], rightActions: [] };
    }

    if (!status) {
      return {
        disabled: false,
        leftActions: splitAction ? [splitAction] : [],
        rightActions: [],
      };
    }

    if (status === "none") {
      return {
        disabled: isPending,
        leftActions: [
          {
            accessibilityLabel: `Add ${name} as a friend`,
            backgroundColor: success.backgroundColor,
            content: (
              <SwipeActionContent
                color={success.foregroundColor}
                icon={UserAdd01Icon}
                label="Add"
              />
            ),
            fullSwipe: true,
            haptic: hapticSuccess,
            key: "add",
            onPress: () => {
              sendRequest.mutate(userId, {
                onError: () => hapticError(),
                onSuccess: () => hapticSuccess(),
              });
            },
            width: 84,
          },
        ],
        rightActions: [],
      };
    }

    if (status === "pending_incoming" && friendshipId) {
      return {
        disabled: isPending,
        leftActions: [
          {
            accessibilityLabel: `Accept ${name}'s friend request`,
            backgroundColor: success.backgroundColor,
            content: (
              <SwipeActionContent
                color={success.foregroundColor}
                icon={CheckmarkCircle02Icon}
                label="Accept"
              />
            ),
            fullSwipe: true,
            haptic: hapticSuccess,
            key: "accept",
            onPress: () => {
              acceptRequest.mutate(friendshipId, {
                onError: () => hapticError(),
                onSuccess: () => hapticSuccess(),
              });
            },
            width: 84,
          },
        ],
        rightActions: [
          {
            accessibilityLabel: `Decline ${name}'s friend request`,
            backgroundColor: danger.backgroundColor,
            content: (
              <SwipeActionContent
                color={danger.foregroundColor}
                icon={Cancel01Icon}
                label="Decline"
              />
            ),
            haptic: hapticError,
            key: "decline",
            onPress: () => {
              rejectRequest.mutate(friendshipId, {
                onError: () => hapticError(),
              });
            },
            width: 84,
          },
        ],
      };
    }

    if (status === "pending_outgoing" && friendshipId) {
      return {
        disabled: isPending,
        leftActions: [],
        rightActions: [
          {
            accessibilityLabel: `Cancel friend request to ${name}`,
            backgroundColor: warning.backgroundColor,
            content: (
              <SwipeActionContent
                color={warning.foregroundColor}
                icon={Cancel01Icon}
                label="Cancel"
              />
            ),
            fullSwipe: true,
            haptic: hapticWarning,
            key: "cancel",
            onPress: () => {
              cancelRequest.mutate(friendshipId, {
                onError: () => hapticError(),
              });
            },
            width: 88,
          },
        ],
      };
    }

    if (status === "friends") {
      return {
        disabled: isPending,
        leftActions: [
          {
            accessibilityHint: "Opens a new split with this friend selected",
            accessibilityLabel: `Create a split with ${name}`,
            backgroundColor: accent.backgroundColor,
            content: (
              <SwipeActionContent
                color={accent.foregroundColor}
                icon={AddInvoiceIcon}
                label="Split"
              />
            ),
            fullSwipe: true,
            key: "split",
            onPress: () => {
              router.push({
                pathname: "/(screens)/split",
                params: { friendId: userId },
              });
            },
            width: 84,
          },
        ],
        rightActions: [
          {
            accessibilityLabel: `Remove ${name} as a friend`,
            backgroundColor: danger.backgroundColor,
            content: (
              <SwipeActionContent
                color={danger.foregroundColor}
                icon={Delete02Icon}
                label="Remove"
              />
            ),
            haptic: hapticError,
            key: "remove",
            onPress: () => {
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
            },
            width: 88,
          },
        ],
      };
    }

    return { disabled: isPending, leftActions: [], rightActions: [] };
  }, [
    acceptRequest,
    accent.backgroundColor,
    accent.foregroundColor,
    cancelRequest,
    danger.backgroundColor,
    danger.foregroundColor,
    enableSplitAction,
    friendshipId,
    isPending,
    name,
    rejectRequest,
    removeFriend,
    sendRequest,
    status,
    success.backgroundColor,
    success.foregroundColor,
    userId,
    warning.backgroundColor,
    warning.foregroundColor,
  ]);
}
