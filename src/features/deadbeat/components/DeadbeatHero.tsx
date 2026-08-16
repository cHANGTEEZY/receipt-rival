import { View } from "react-native";

import type { RankBoardKind } from "@/api/deadbeat";

import { Typography } from "heroui-native/text";

type DeadbeatHeroProps = {
  variant: RankBoardKind;
};

export function DeadbeatHero({ variant }: DeadbeatHeroProps) {
  const isFame = variant === "fame";

  return (
    <View className="gap-1 px-1 pt-1">
      <Typography type="h3" weight="bold">
        {isFame ? "Hall of Fame" : "Wall of Shame"}
      </Typography>
      <Typography type="body-sm" color="muted">
        {isFame
          ? "Ranked by paying on time and not making it weird."
          : "Ranked by lateness, excuses, and emotional damage."}
      </Typography>
    </View>
  );
}
