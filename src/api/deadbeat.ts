import { api } from "@/lib/api-client";

import { ENDPOINTS } from "./endpoints";

export type RankBoardKind = "shame" | "fame";

export type DeadbeatPublicUser = {
  id: string;
  name: string;
  image: string | null;
};

export type DeadbeatLeaderboardEntry = {
  rank: number;
  user: DeadbeatPublicUser;
  shameScore: number;
  fameScore: number;
  title: string;
  daysLate: number;
  overdueCount: number;
  overdueAmountCents: number;
  settledCount: number;
  currency: string;
  isCurrentUser: boolean;
};

export type DeadbeatMeSummary = {
  rank: number;
  shameScore: number;
  fameScore: number;
  title: string;
};

export type DeadbeatBoard = {
  entries: DeadbeatLeaderboardEntry[];
  me: DeadbeatMeSummary | null;
};

export type DeadbeatLeaderboard = {
  shame: DeadbeatBoard;
  fame: DeadbeatBoard;
};

type LeaderboardResponse = {
  success: boolean;
  data: DeadbeatLeaderboard;
  requestId: string;
};

export const deadbeatApi = {
  leaderboard: async () => {
    const response = await api.get<LeaderboardResponse>(
      ENDPOINTS.deadbeat.leaderboard,
    );
    return response.data.data;
  },
};
