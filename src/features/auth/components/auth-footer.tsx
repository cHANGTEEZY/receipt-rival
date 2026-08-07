import { Link } from "expo-router";
import { Pressable, View } from "react-native";

import { Typography } from "heroui-native/text";

type AuthFooterProps = {
  prompt: string;
  actionLabel: string;
  href: "/sign-in" | "/sign-up";
};

export function AuthFooter({ prompt, actionLabel, href }: AuthFooterProps) {
  return (
    <View className="mt-auto flex-row items-center justify-center pt-8 pb-2">
      <Typography type="body" color="muted">
        {prompt}{" "}
      </Typography>
      <Link href={href} asChild>
        <Pressable
          hitSlop={8}
          accessibilityRole="link"
          className="min-h-11 justify-center"
        >
          <Typography type="body" weight="semibold" className="text-accent">
            {actionLabel}
          </Typography>
        </Pressable>
      </Link>
    </View>
  );
}
