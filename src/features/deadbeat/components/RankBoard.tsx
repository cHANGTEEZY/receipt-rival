import { View } from "react-native";

import type { DeadbeatLeaderboardEntry, RankBoardKind } from "@/api/deadbeat";

import { Typography } from "heroui-native/text";

import { DeadbeatHero } from "./DeadbeatHero";
import { DeadbeatPodium } from "./DeadbeatPodium";
import { DeadbeatRankRow } from "./DeadbeatRankRow";
import { splitRanks } from "../lib/split-ranks";

type RankBoardProps = {
  variant: RankBoardKind;
  entries: DeadbeatLeaderboardEntry[];
};

export function RankBoard({ variant, entries }: RankBoardProps) {
  const { podium, rest } = splitRanks(entries);

  return (
    <View className="mt-4 gap-6">
      <DeadbeatHero variant={variant} />
      <DeadbeatPodium entries={podium} />

      {rest.length > 0 ? (
        <View className="gap-3">
          <Typography type="h5" weight="semibold" className="px-1">
            The rest of the pack
          </Typography>
          <View className="gap-2">
            {rest.map((entry) => (
              <DeadbeatRankRow
                key={entry.user.id}
                entry={entry}
                variant={variant}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
