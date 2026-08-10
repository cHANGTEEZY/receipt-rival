import { Avatar } from "heroui-native/avatar";

import { getInitials } from "../lib/friendship-status";

type UserAvatarProps = {
  name: string;
  image?: string | null;
  size?: "sm" | "md";
};

export function UserAvatar({ name, image, size = "md" }: UserAvatarProps) {
  const initials = getInitials(name);
  const hasImage = Boolean(image?.trim());

  return (
    <Avatar size={size === "sm" ? "sm" : "md"} color="accent" variant="soft">
      {hasImage ? (
        <Avatar.Image source={{ uri: image! }} accessibilityLabel={name} />
      ) : null}
      <Avatar.Fallback>{initials}</Avatar.Fallback>
    </Avatar>
  );
}
