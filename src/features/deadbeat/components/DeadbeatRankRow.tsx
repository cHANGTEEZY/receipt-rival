import { View } from "react-native";

import type { DeadbeatLeaderboardEntry, RankBoardKind } from "@/api/deadbeat";
import { UserAvatar } from "@/features/friends/components/UserAvatar";

import { Typography } from "heroui-native/text";

import { DaysLateBadge } from "./DaysLateBadge";
import { RankTitleChip } from "./RankTitleChip";

type DeadbeatRankRowProps = {
  entry: DeadbeatLeaderboardEntry;
  variant: RankBoardKind;
};

export function DeadbeatRankRow({ entry, variant }: DeadbeatRankRowProps) {
  const displayName = entry.isCurrentUser ? "You" : entry.user.name;
  const score = variant === "fame" ? entry.fameScore : entry.shameScore;
  const scoreLabel = variant === "fame" ? "Fame" : "Shame";

  return (
    <View
      className="flex-row items-center gap-3 rounded-3xl bg-surface px-3.5 py-3"
      style={{ borderCurve: "continuous" }}
    >
      <Typography
        type="h5"
        weight="bold"
        className="w-6 text-center text-muted"
      >
        {entry.rank}
      </Typography>

      <UserAvatar
        name={entry.user.name}
        userId={entry.user.id}
        image={entry.user.image}
      />

      <View className="min-w-0 flex-1 gap-1">
        <Typography type="body-sm" weight="semibold" numberOfLines={1}>
          {displayName}
        </Typography>
        <RankTitleChip title={entry.title} variant={variant} />
        <Typography type="body-xs" color="muted" numberOfLines={1}>
          {scoreLabel}: {score}/100
        </Typography>
      </View>

      {variant === "shame" ? (
        <DaysLateBadge daysLate={entry.daysLate} />
      ) : null}
    </View>
  );
}
