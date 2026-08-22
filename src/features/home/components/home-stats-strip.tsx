import { View } from "react-native";

import type { PaymentSplit } from "@/api/splits";

import { Typography } from "heroui-native/text";

export type HomeStats = {
  activeSplits: number;
  settledSplits: number;
  people: number;
};

/** Derives headline stats from pending/settled split lists. */
export function computeHomeStats(
  owedByMe: PaymentSplit[],
  owedToMe: PaymentSplit[],
): HomeStats {
  const people = new Set<string>();
  let active = 0;
  let settled = 0;

  for (const split of owedByMe) {
    if (split.status === "pending") active += 1;
    if (split.status === "settled") settled += 1;
    people.add(split.creditorUserId);
  }

  for (const split of owedToMe) {
    if (split.status === "pending") active += 1;
    if (split.status === "settled") settled += 1;
    people.add(split.debtorUserId);
  }

  return {
    activeSplits: active,
    settledSplits: settled,
    people: people.size,
  };
}

type StatTileProps = {
  label: string;
  value: number | string;
};

function StatTile({ label, value }: StatTileProps) {
  return (
    <View className="min-w-0 flex-1 items-center gap-0.5">
      <Typography type="h4" weight="bold" numberOfLines={1}>
        {value}
      </Typography>
      <Typography
        type="body-xs"
        color="muted"
        className="text-center"
        numberOfLines={1}
      >
        {label}
      </Typography>
    </View>
  );
}

export function HomeStatsStrip({ stats }: { stats: HomeStats }) {
  // Low-data guard: nothing meaningful to count yet.
  if (
    stats.activeSplits === 0 &&
    stats.settledSplits === 0 &&
    stats.people === 0
  ) {
    return null;
  }

  return (
    <View
      className="flex-row rounded-4xl bg-surface px-2 py-4"
      style={{ borderCurve: "continuous" }}
    >
      <StatTile label="Active splits" value={stats.activeSplits} />
      <View className="w-px bg-border" />
      <StatTile label="Settled" value={stats.settledSplits} />
      <View className="w-px bg-border" />
      <StatTile label="People" value={stats.people} />
    </View>
  );
}
