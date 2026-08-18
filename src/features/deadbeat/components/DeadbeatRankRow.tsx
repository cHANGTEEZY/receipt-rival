import { router } from "expo-router";
import { Share, View } from "react-native";

import {
  AddInvoiceIcon,
  Award01Icon,
  ArrowUpRight01Icon,
} from "@hugeicons/core-free-icons";

import type { DeadbeatLeaderboardEntry, RankBoardKind } from "@/api/deadbeat";
import {
  SwipeActionContent,
  useSwipeActionTone,
} from "@/components/swipe-action-content";
import { SwipeableRow } from "@/components/SwipeableRow";
import { UserAvatar } from "@/features/friends/components/UserAvatar";

import { Typography } from "heroui-native/text";

import { DaysLateBadge } from "./DaysLateBadge";
import { RankTitleChip } from "./RankTitleChip";

type DeadbeatRankRowProps = {
  entry: DeadbeatLeaderboardEntry;
  variant: RankBoardKind;
};

export function DeadbeatRankRow({ entry, variant }: DeadbeatRankRowProps) {
  const accent = useSwipeActionTone("accent");
  const shareTone = useSwipeActionTone(variant === "shame" ? "danger" : "success");
  const displayName = entry.isCurrentUser ? "You" : entry.user.name;
  const score = variant === "fame" ? entry.fameScore : entry.shameScore;
  const scoreLabel = variant === "fame" ? "Fame" : "Shame";
  const shareMessage =
    variant === "shame"
      ? `${displayName} is #${entry.rank} on the Wall of Shame with ${score}/100 shame${
          entry.daysLate > 0 ? ` and ${entry.daysLate} days late` : ""
        }.`
      : `${displayName} is #${entry.rank} in the Hall of Fame with ${score}/100 fame.`;

  return (
    <SwipeableRow
      leftActions={
        entry.isCurrentUser
          ? []
          : [
              {
                accessibilityHint: "Opens a new split with this person selected",
                accessibilityLabel: `Create a split with ${entry.user.name}`,
                backgroundColor: accent.backgroundColor,
                content: (
                  <SwipeActionContent
                    color={accent.foregroundColor}
                    icon={AddInvoiceIcon}
                    label="Split"
                  />
                ),
                fullSwipe: true,
                key: "split",
                onPress: () => {
                  router.push({
                    pathname: "/(screens)/split",
                    params: { friendId: entry.user.id },
                  });
                },
                width: 84,
              },
            ]
      }
      rightActions={[
        {
          accessibilityLabel: `Share ${displayName}'s ${scoreLabel.toLowerCase()} rank`,
          backgroundColor: shareTone.backgroundColor,
          content: (
            <SwipeActionContent
              color={shareTone.foregroundColor}
              icon={variant === "fame" ? Award01Icon : ArrowUpRight01Icon}
              label="Share"
            />
          ),
          key: "share",
          onPress: () => {
            void Share.share({
              message: shareMessage,
              title: `${scoreLabel} rank`,
            });
          },
          width: 80,
        },
      ]}
    >
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
    </SwipeableRow>
  );
}
