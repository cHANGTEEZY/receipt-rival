import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Pressable, View } from "react-native";
import { useCSSVariable } from "uniwind";

import { useFriendsList } from "@/api/hooks/use-friends";
import { FriendListEmpty } from "@/features/friends/components/FriendListEmpty";
import { FriendListItem } from "@/features/friends/components/FriendListItem";
import { FriendListSkeleton } from "@/features/friends/components/FriendListSkeleton";
import { getAcceptedFriends } from "@/features/friends/lib/friendship-status";

import { FieldError } from "heroui-native/field-error";
import { Typography } from "heroui-native/text";

type SplitFriendsFieldProps = {
  value: string[];
  onChange: (friendIds: string[]) => void;
  error?: string | null;
};

export function SplitFriendsField({
  value,
  onChange,
  error,
}: SplitFriendsFieldProps) {
  const accent = useCSSVariable("--color-accent");
  const muted = useCSSVariable("--color-muted");
  const accentColor = typeof accent === "string" ? accent : "#3b82f6";
  const mutedColor = typeof muted === "string" ? muted : "#8a8a8f";

  const { data, isLoading, isError } = useFriendsList();
  const friends = getAcceptedFriends(data?.data ?? []);
  const selected = new Set(value);

  const toggleFriend = (friendId: string) => {
    if (selected.has(friendId)) {
      onChange(value.filter((id) => id !== friendId));
      return;
    }
    onChange([...value, friendId]);
  };

  if (isLoading) {
    return <FriendListSkeleton />;
  }

  if (isError) {
    return (
      <Typography type="body-sm" className="text-danger">
        Couldn’t load friends. Pull to refresh from the friends screen, then try
        again.
      </Typography>
    );
  }

  if (friends.length === 0) {
    return (
      <FriendListEmpty
        title="No friends yet"
        description="Add friends first, then come back to include them in this split."
      />
    );
  }

  return (
    <View className="gap-2">
      {friends.map((friend) => {
        const isSelected = selected.has(friend.id);

        return (
          <Pressable
            key={friend.id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            onPress={() => toggleFriend(friend.id)}
          >
            <FriendListItem
              name={friend.name}
              image={friend.image}
              subtitle={isSelected ? "Included in this split" : "Tap to include"}
              trailing={
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={22}
                  color={isSelected ? accentColor : mutedColor}
                  strokeWidth={isSelected ? 2 : 1.5}
                />
              }
            />
          </Pressable>
        );
      })}
      {error ? <FieldError>{error}</FieldError> : null}
    </View>
  );
}
