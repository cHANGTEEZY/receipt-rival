import { View } from "react-native";

import type { RankBoardKind } from "@/api/deadbeat";

import { Typography } from "heroui-native/text";

type RankTitleChipProps = {
  title: string;
  variant: RankBoardKind;
};

export function RankTitleChip({ title, variant }: RankTitleChipProps) {
  const tone = variant === "fame" ? "bg-success/15" : "bg-danger/12";
  const textTone = variant === "fame" ? "text-success" : "text-danger";

  return (
    <View
      className={`self-start rounded-full px-2 py-0.5 ${tone}`}
      style={{ borderCurve: "continuous" }}
    >
      <Typography type="body-xs" weight="semibold" className={textTone} numberOfLines={1}>
        {title}
      </Typography>
    </View>
  );
}
