import { useState } from "react";
import { View } from "react-native";

import type { RankBoardKind } from "@/api/deadbeat";
import { useDeadbeatLeaderboard } from "@/api/hooks/use-deadbeat";
import CollapsingLargeHeader from "@/components/layouts/CollapsingLargeHeader";
import MeshBackground from "@/components/MeshBackground";
import SplitFab from "@/components/SplitFab";
import { SwipeMenuButton } from "@/features/swipe-menu";

import { Tabs } from "heroui-native/tabs";
import { Typography } from "heroui-native/text";

import { DeadbeatEmpty } from "../components/DeadbeatEmpty";
import { DeadbeatSkeleton } from "../components/DeadbeatSkeleton";
import { RankBoard } from "../components/RankBoard";

export default function RanksScreen() {
  const [activeTab, setActiveTab] = useState<RankBoardKind>("shame");
  const leaderboardQuery = useDeadbeatLeaderboard();

  const shameEntries = leaderboardQuery.data?.shame.entries ?? [];
  const fameEntries = leaderboardQuery.data?.fame.entries ?? [];
  const isLoading = leaderboardQuery.isLoading;
  const isError = leaderboardQuery.isError;
  const isFetching = leaderboardQuery.isFetching;
  const showEmpty =
    !isLoading && !isError && shameEntries.length === 0 && fameEntries.length === 0;

  return (
    <View className="flex-1 bg-background">
      <MeshBackground />
      <CollapsingLargeHeader title="Ranks" leading={<SwipeMenuButton />}>
        <View className="gap-4 px-4 pb-8">
          {isLoading ? <DeadbeatSkeleton /> : null}

          {!isLoading && isError ? (
            <Typography type="body-sm" className="text-danger">
              Couldn’t load the ranks
              {isFetching ? " — retrying…" : "."}
            </Typography>
          ) : null}

          {showEmpty ? <DeadbeatEmpty /> : null}

          {!isLoading && !isError && !showEmpty ? (
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as RankBoardKind)}
              variant="secondary"
            >
              <Tabs.List>
                <Tabs.ScrollView scrollAlign="center">
                  <Tabs.Indicator />
                  <Tabs.Trigger value="shame">
                    <Tabs.Label>Wall of Shame</Tabs.Label>
                  </Tabs.Trigger>
                  <Tabs.Separator betweenValues={["shame", "fame"]} />
                  <Tabs.Trigger value="fame">
                    <Tabs.Label>Hall of Fame</Tabs.Label>
                  </Tabs.Trigger>
                </Tabs.ScrollView>
              </Tabs.List>

              <Tabs.Content value="shame">
                <RankBoard variant="shame" entries={shameEntries} />
              </Tabs.Content>
              <Tabs.Content value="fame">
                <RankBoard variant="fame" entries={fameEntries} />
              </Tabs.Content>
            </Tabs>
          ) : null}
        </View>
      </CollapsingLargeHeader>

      <SplitFab />
    </View>
  );
}
