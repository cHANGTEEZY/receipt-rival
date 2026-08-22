import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useCSSVariable } from "uniwind";

import type { DeadbeatLeaderboardEntry } from "@/api/deadbeat";
import { UserAvatar } from "@/features/friends/components/UserAvatar";
import { RankTitleChip } from "@/features/deadbeat/components/RankTitleChip";
import { hapticSelection } from "@/lib/haptics";

import { Typography } from "heroui-native/text";

/** Medal palette mirrors the ranks podium (gold / silver / bronze). */
const MEDAL = {
  1: { bg: "#FFD56B", text: "#5C4400" },
  2: { bg: "#D1DCE5", text: "#3E4C58" },
  3: { bg: "#FFC4BC", text: "#6B3328" },
} as const;

type HomeTopRanksProps = {
  entries: DeadbeatLeaderboardEntry[];
  /** Total entries on the board, to show a "+N more" hint when > top 3. */
  totalCount?: number;
};

function TopRankRow({ entry }: { entry: DeadbeatLeaderboardEntry }) {
  const muted = useCSSVariable("--color-muted");
  const mutedColor = typeof muted === "string" ? muted : "#8a8a8f";
  const rank = (entry.rank === 1 || entry.rank === 2 || entry.rank === 3
    ? entry.rank
    : 3) as 1 | 2 | 3;
  const medal = MEDAL[rank];
  const displayName = entry.isCurrentUser ? "You" : entry.user.name;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${displayName}'s profile, rank ${entry.rank}`}
      onPress={() => {
        hapticSelection();
        router.push(`/(screens)/user/${entry.user.id}`);
      }}
    >
      <View
        className="flex-row items-center gap-3 rounded-3xl bg-surface-secondary px-3 py-2.5"
        style={{ borderCurve: "continuous" }}
      >
        <View
          className="size-9 items-center justify-center rounded-full"
          style={{ backgroundColor: medal.bg }}
        >
          <Typography type="body-sm" weight="bold" style={{ color: medal.text }}>
            {entry.rank}
          </Typography>
        </View>

        <UserAvatar
          name={entry.user.name}
          userId={entry.user.id}
          image={entry.user.image}
          size="sm"
        />

        <View className="min-w-0 flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Typography
              type="body-sm"
              weight="semibold"
              numberOfLines={1}
              className="shrink"
            >
              {displayName}
            </Typography>
            {entry.isCurrentUser ? (
              <View className="rounded-full bg-accent/15 px-1.5 py-0.5">
                <Typography
                  type="body-xs"
                  weight="bold"
                  className="text-accent"
                  numberOfLines={1}
                >
                  YOU
                </Typography>
              </View>
            ) : null}
          </View>
          <RankTitleChip title={entry.title} variant="shame" />
        </View>

        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={16}
          color={mutedColor}
          strokeWidth={1.75}
        />
      </View>
    </Pressable>
  );
}

export function HomeTopRanks({
  entries,
  totalCount,
}: HomeTopRanksProps) {
  const muted = useCSSVariable("--color-muted");
  const mutedColor = typeof muted === "string" ? muted : "#8a8a8f";

  // Nothing to show — parent hides this section entirely on zero.
  if (entries.length === 0) return null;

  const topThree = entries.slice(0, 3);
  const remaining = Math.max((totalCount ?? entries.length) - topThree.length, 0);

  return (
    <View className="gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="View all ranks"
        className="flex-row items-center justify-between px-1"
        onPress={() => {
          hapticSelection();
          router.push("/(app)/ranks");
        }}
      >
        <View className="flex-row items-center gap-2">
          <Typography type="h5" weight="semibold">
            Wall of Shame
          </Typography>
          <View className="h-1.5 w-1.5 rounded-full bg-danger" />
        </View>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={18}
          color={mutedColor}
          strokeWidth={1.75}
        />
      </Pressable>

      <View
        className="gap-2 rounded-4xl bg-surface p-3"
        style={{ borderCurve: "continuous" }}
      >
        {topThree.map((entry) => (
          <TopRankRow key={entry.user.id} entry={entry} />
        ))}

        {remaining > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              hapticSelection();
              router.push("/(app)/ranks");
            }}
            className="items-center py-1.5"
          >
            <Typography type="body-xs" color="muted" weight="semibold">
              +{remaining} more on the board
            </Typography>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
