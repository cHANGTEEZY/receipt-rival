import { View } from "react-native";

import type { DeadbeatLeaderboardEntry } from "@/api/deadbeat";
import { podiumPlaces } from "../lib/split-ranks";

import { DeadbeatPodiumPlace } from "./DeadbeatPodiumPlace";

type DeadbeatPodiumProps = {
  entries: DeadbeatLeaderboardEntry[];
};

export function DeadbeatPodium({ entries }: DeadbeatPodiumProps) {
  const { first, second, third } = podiumPlaces(entries);

  if (!first) return null;

  return (
    <View className="flex-row items-end gap-2 px-1 pt-16">
      <View className="flex-1">
        {second ? <DeadbeatPodiumPlace entry={second} /> : null}
      </View>
      <View className="flex-1">
        <DeadbeatPodiumPlace entry={first} />
      </View>
      <View className="flex-1">
        {third ? <DeadbeatPodiumPlace entry={third} /> : null}
      </View>
    </View>
  );
}
