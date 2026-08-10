import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { friendsApi } from "../friends";

export const FRIENDS_QUERY_KEYS = {
  list: ["friends"] as const,
  listIncomingRequests: ["friends-incoming-requests"] as const,
};

function invalidateFriendQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.list });
  queryClient.invalidateQueries({
    queryKey: FRIENDS_QUERY_KEYS.listIncomingRequests,
  });
  queryClient.invalidateQueries({ queryKey: ["users", "search"] });
}

export const useFriendsList = () => {
  return useQuery({
    queryKey: FRIENDS_QUERY_KEYS.list,
    queryFn: friendsApi.list,
  });
};

export const useFriendsListIncomingRequests = () => {
  return useQuery({
    queryKey: FRIENDS_QUERY_KEYS.listIncomingRequests,
    queryFn: friendsApi.listIncomingRequests,
  });
};

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendUserId: string) =>
      friendsApi.sendFriendRequest(friendUserId),
    onSuccess: () => invalidateFriendQueries(queryClient),
  });
};

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendShipId: string) =>
      friendsApi.acceptFriendRequest(friendShipId),
    onSuccess: () => invalidateFriendQueries(queryClient),
  });
};

export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendShipId: string) =>
      friendsApi.rejectFriendRequest(friendShipId),
    onSuccess: () => invalidateFriendQueries(queryClient),
  });
};

export const useRemoveFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendUserId: string) => friendsApi.removeFriend(friendUserId),
    onSuccess: () => invalidateFriendQueries(queryClient),
  });
};

export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendShipId: string) =>
      friendsApi.cancelFriendRequest(friendShipId),
    onSuccess: () => invalidateFriendQueries(queryClient),
  });
};
