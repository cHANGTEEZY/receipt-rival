import { View } from "react-native";

import { Typography } from "heroui-native/text";

type FriendListEmptyProps = {
  title: string;
  description: string;
};

export function FriendListEmpty({ title, description }: FriendListEmptyProps) {
  return (
    <View
      className="items-center gap-2 rounded-3xl bg-surface-secondary px-5 py-8"
      style={{ borderCurve: "continuous" }}
    >
      <Typography type="body" weight="semibold" className="text-center">
        {title}
      </Typography>
      <Typography type="body-sm" color="muted" className="text-center">
        {description}
      </Typography>
    </View>
  );
}
