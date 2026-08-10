import type {
  FriendshipRecord,
  IncomingFriendRequest,
} from "@/api/friends";
import type { SearchUser } from "@/api/users";

export type FriendshipUIStatus =
  | "self"
  | "none"
  | "friends"
  | "pending_outgoing"
  | "pending_incoming";

export type ResolvedFriendship = {
  status: FriendshipUIStatus;
  friendshipId?: string;
};

type ResolveFriendshipParams = {
  userId: string;
  currentUserId?: string;
  friendships: FriendshipRecord[];
  incomingRequests: IncomingFriendRequest[];
};

export function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function resolveFriendshipStatus({
  userId,
  currentUserId,
  friendships,
  incomingRequests,
}: ResolveFriendshipParams): ResolvedFriendship {
  if (currentUserId && userId === currentUserId) {
    return { status: "self" };
  }

  const incoming = incomingRequests.find(
    (request) => request.requester.id === userId,
  );
  if (incoming) {
    return {
      status: "pending_incoming",
      friendshipId: incoming.id,
    };
  }

  const record = friendships.find(
    (friendship) =>
      friendship.friend.id === userId ||
      friendship.requesterId === userId ||
      friendship.adresseId === userId,
  );

  if (!record) {
    return { status: "none" };
  }

  if (record.status === "accepted") {
    return { status: "friends", friendshipId: record.id };
  }

  if (record.status === "pending") {
    if (record.requesterId === currentUserId) {
      return { status: "pending_outgoing", friendshipId: record.id };
    }

    return { status: "pending_incoming", friendshipId: record.id };
  }

  return { status: "none" };
}

export function resolveSearchUserFriendshipStatus(
  user: SearchUser,
  currentUserId?: string,
): ResolvedFriendship {
  if (currentUserId && user.id === currentUserId) {
    return { status: "self" };
  }

  if (user.friendRequestStatus === "accepted") {
    return {
      status: "friends",
      friendshipId: user.friendshipId ?? undefined,
    };
  }

  if (user.friendRequestStatus === "pending") {
    if (user.requestDirection === "sent") {
      return {
        status: "pending_outgoing",
        friendshipId: user.friendshipId ?? undefined,
      };
    }

    if (user.requestDirection === "received") {
      return {
        status: "pending_incoming",
        friendshipId: user.friendshipId ?? undefined,
      };
    }
  }

  return { status: "none" };
}

export function getAcceptedFriends(friendships: FriendshipRecord[]) {
  return friendships
    .filter((friendship) => friendship.status === "accepted")
    .map((friendship) => friendship.friend);
}
