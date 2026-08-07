import { Pressable } from "react-native";

import { useSession } from "@/lib/auth-client";

import {
  Avatar,
  type AvatarColor,
  type AvatarSize,
} from "heroui-native/avatar";

type AvatarVariant = "default" | "soft";
type ProfileButtonSize = AvatarSize | "xlg";

type ProfileButtonProps = {
  size?: ProfileButtonSize;
  color?: AvatarColor;
  variant?: AvatarVariant;
  onPress?: () => void;
};

const SOLID_BG: Record<AvatarColor, string> = {
  accent: "bg-accent",
  default: "bg-default",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const SOLID_TEXT: Record<AvatarColor, string> = {
  accent: "text-accent-foreground",
  default: "text-default-foreground",
  success: "text-success-foreground",
  warning: "text-warning-foreground",
  danger: "text-danger-foreground",
};

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function resolveAvatarSize(size: ProfileButtonSize): {
  avatarSize: AvatarSize;
  rootClassName: string;
  textClassName?: string;
} {
  if (size === "xlg") {
    return {
      avatarSize: "lg",
      rootClassName: "size-20",
      textClassName: "text-lg",
    };
  }

  const sizeClasses: Record<AvatarSize, string> = {
    sm: "size-10",
    md: "size-12",
    lg: "size-16",
  };

  return { avatarSize: size, rootClassName: sizeClasses[size] };
}

export default function ProfileButton({
  size = "sm",
  color = "accent",
  variant = "default",
  onPress,
}: ProfileButtonProps) {
  const { data: session } = useSession();
  const initials = getInitials(session?.user?.name);
  const isSolid = variant === "default";
  const { avatarSize, rootClassName, textClassName } = resolveAvatarSize(size);

  const rootClasses = [rootClassName, isSolid ? SOLID_BG[color] : undefined]
    .filter(Boolean)
    .join(" ");

  const fallbackTextClasses = [
    isSolid ? SOLID_TEXT[color] : undefined,
    textClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Profile"
      hitSlop={8}
      onPress={() => {
        onPress?.();
      }}
    >
      <Avatar
        size={avatarSize}
        color={color}
        variant={variant}
        className={rootClasses || undefined}
      >
        {initials ? (
          <Avatar.Fallback
            classNames={{
              text: fallbackTextClasses || undefined,
            }}
          >
            {initials}
          </Avatar.Fallback>
        ) : (
          <Avatar.Fallback />
        )}
      </Avatar>
    </Pressable>
  );
}
