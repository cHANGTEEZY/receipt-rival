import { Avatar } from "heroui-native/avatar";

import { publicImageUrl } from "@/api/users";
import { getInitials } from "../lib/friendship-status";

type UserAvatarProps = {
  name: string;
  userId?: string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
};

export function UserAvatar({
  name,
  image,
  size = "md",
}: UserAvatarProps) {
  const initials = getInitials(name);
  const uri = publicImageUrl(image);

  return (
    <Avatar size={size} color="accent" variant="soft">
      {uri ? (
        <Avatar.Image source={{ uri }} accessibilityLabel={name} />
      ) : null}
      <Avatar.Fallback>{initials}</Avatar.Fallback>
    </Avatar>
  );
}
