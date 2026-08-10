import { api } from "@/lib/api-client";
import { ENDPOINTS } from "./endpoints";

export type FriendProfile = {
  id: string;
  name: string;
  image: string;
};

export type FriendshipRecord = {
  id: string;
  requesterId: string;
  adresseId: string;
  status: "pending" | "accepted" | "remooved";
  friend: FriendProfile;
  requestedAt: string;
  acceptedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type IncomingFriendRequest = {
  id: string;
  requesterId: string;
  adresseId: string;
  status: "pending" | "accepted" | "remooved";
  requester: FriendProfile;
  requestedAt: string;
  createdAt: string;
};

type FriendsListResponse = {
  success: boolean;
  data: FriendshipRecord[];
  requestId: string;
};

type FriendRequestResponse = FriendsListResponse;
type AcceptFriendRequestResponse = FriendsListResponse;

type RejectFriendRequestResponse = {
  success: boolean;
  data: {
    id: string;
  };
  requestId: string;
};

type RemoveFriendResponse = {
  success: boolean;
  data: {
    friendUserId: string;
  };
  requestId: string;
};

type FriendsListIncomingRequestsResponse = {
  success: boolean;
  data: IncomingFriendRequest[];
  requestId: string;
};

export const friendsApi = {
  list: async () => {
    const response = await api.get<FriendsListResponse>(ENDPOINTS.friends.list);
    return response.data;
  },

  listIncomingRequests: async () => {
    const response = await api.get<FriendsListIncomingRequestsResponse>(
      ENDPOINTS.friends.listIncomingRequests,
    );
    return response.data;
  },

  sendFriendRequest: async (friendUserId: string) => {
    const response = await api.post<FriendRequestResponse>(
      ENDPOINTS.friends.sendFriendRequest,
      { userId: friendUserId },
    );
    return response.data;
  },

  cancelFriendRequest: async (friendShipId: string) => {
    const response = await api.post<FriendRequestResponse>(
      ENDPOINTS.friends.cancelFriendRequest(friendShipId),
    );
    return response.data;
  },

  acceptFriendRequest: async (friendShipId: string) => {
    const response = await api.post<AcceptFriendRequestResponse>(
      ENDPOINTS.friends.acceptFriendRequest(friendShipId),
    );
    return response.data;
  },

  rejectFriendRequest: async (friendShipId: string) => {
    const response = await api.post<RejectFriendRequestResponse>(
      ENDPOINTS.friends.rejectFriendRequest(friendShipId),
    );
    return response.data;
  },

  removeFriend: async (friendUserId: string) => {
    const response = await api.delete<RemoveFriendResponse>(
      ENDPOINTS.friends.removeFriend(friendUserId),
    );
    return response.data;
  },
};
