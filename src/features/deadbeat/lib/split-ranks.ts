import type { DeadbeatLeaderboardEntry } from "@/api/deadbeat";

export type PodiumPlaces = {
  first: DeadbeatLeaderboardEntry | null;
  second: DeadbeatLeaderboardEntry | null;
  third: DeadbeatLeaderboardEntry | null;
};

export function splitRanks(entries: DeadbeatLeaderboardEntry[]): {
  podium: DeadbeatLeaderboardEntry[];
  rest: DeadbeatLeaderboardEntry[];
} {
  return {
    podium: entries.slice(0, 3),
    rest: entries.slice(3),
  };
}

export function podiumPlaces(
  podium: DeadbeatLeaderboardEntry[],
): PodiumPlaces {
  return {
    first: podium[0] ?? null,
    second: podium[1] ?? null,
    third: podium[2] ?? null,
  };
}
