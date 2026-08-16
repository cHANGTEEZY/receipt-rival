import { useQuery } from "@tanstack/react-query";

import { deadbeatApi } from "../deadbeat";

export const DEADBEAT_QUERY_KEYS = {
  leaderboard: ["deadbeat", "leaderboard"] as const,
};

export const useDeadbeatLeaderboard = () => {
  return useQuery({
    queryKey: DEADBEAT_QUERY_KEYS.leaderboard,
    queryFn: deadbeatApi.leaderboard,
  });
};
