import { View } from "react-native";

import type { DeadbeatLeaderboardEntry } from "@/api/deadbeat";
import { formatMoney } from "@/utils/money";

import { Typography } from "heroui-native/text";

type StatTile = {
  label: string;
  value: string;
  valueClass?: string;
};

function StatTileView({ tile }: { tile: StatTile }) {
  return (
    <View
      className="flex-1 items-center gap-1 rounded-3xl bg-surface px-2 py-3.5"
      style={{ borderCurve: "continuous" }}
    >
      <Typography type="h5" weight="bold" className={tile.valueClass}>
        {tile.value}
      </Typography>
      <Typography
        type="body-xs"
        color="muted"
        className="text-center"
        numberOfLines={1}
      >
        {tile.label}
      </Typography>
    </View>
  );
}

function buildTiles(
  shameEntry?: DeadbeatLeaderboardEntry,
  fameEntry?: DeadbeatLeaderboardEntry,
): StatTile[] {
  const tiles: StatTile[] = [];
  const entry = shameEntry ?? fameEntry;

  if (shameEntry) {
    tiles.push({
      label: "Shame score",
      value: `${shameEntry.shameScore}`,
      valueClass: "text-danger",
    });
    if (shameEntry.daysLate > 0) {
      tiles.push({
        label: shameEntry.daysLate === 1 ? "Day late" : "Days late",
        value: `${shameEntry.daysLate}`,
      });
    }
    if (shameEntry.overdueCount > 0) {
      tiles.push({ label: "Overdue splits", value: `${shameEntry.overdueCount}` });
    }
  }

  if (fameEntry) {
    tiles.push({
      label: "Fame score",
      value: `${fameEntry.fameScore}`,
      valueClass: "text-success",
    });
  }

  if (entry && entry.settledCount > 0) {
    tiles.push({
      label: "Settled splits",
      value: `${entry.settledCount}`,
      valueClass: fameEntry ? "text-success" : undefined,
    });
  }

  return tiles;
}

export function ProfileRankStats({
  shameEntry,
  fameEntry,
}: {
  shameEntry?: DeadbeatLeaderboardEntry;
  fameEntry?: DeadbeatLeaderboardEntry;
}) {
  const entry = shameEntry ?? fameEntry;
  const tiles = buildTiles(shameEntry, fameEntry);

  // Not ranked yet — show a gentle hint instead of an empty section.
  if (!entry || tiles.length === 0) {
    return (
      <View
        className="items-center gap-1 rounded-3xl bg-surface px-5 py-4"
        style={{ borderCurve: "continuous" }}
      >
        <Typography type="body-sm" weight="semibold">
          Not ranked yet
        </Typography>
        <Typography type="body-xs" color="muted" className="text-center">
          Split something with this person to start a scoreboard.
        </Typography>
      </View>
    );
  }

  const boardLabel =
    shameEntry && fameEntry
      ? "Shame & Fame"
      : shameEntry
        ? `Wall of Shame · #${shameEntry.rank}`
        : `Hall of Fame · #${fameEntry?.rank}`;

  return (
    <View className="gap-3">
      <Typography type="body-sm" weight="semibold" className="px-1 text-muted">
        {boardLabel}
      </Typography>
      <View className="flex-row gap-2">
        {tiles.slice(0, 4).map((tile) => (
          <StatTileView key={tile.label} tile={tile} />
        ))}
      </View>
      {entry.currency && entry.overdueAmountCents > 0 ? (
        <Typography type="body-xs" color="muted" className="px-1">
          Overdue total: {formatMoney(entry.overdueAmountCents, entry.currency)}
        </Typography>
      ) : null}
    </View>
  );
}
