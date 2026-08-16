import type { FriendProfile } from "@/api/friends";

export function resolveUserName(
  userId: string,
  options: {
    currentUserId?: string;
    currentUserName?: string | null;
    friends: FriendProfile[];
  },
): string {
  if (options.currentUserId && userId === options.currentUserId) {
    return options.currentUserName?.trim() || "You";
  }

  const friend = options.friends.find((entry) => entry.id === userId);
  return friend?.name?.trim() || "Friend";
}
