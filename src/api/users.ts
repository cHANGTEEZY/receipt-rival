import { api } from "@/lib/api-client";
import { ENDPOINTS } from "./endpoints";

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FriendRequestStatus = null | "pending" | "accepted";
export type FriendRequestDirection = "sent" | "received";

export type SearchUser = User & {
  friendRequestStatus: FriendRequestStatus;
  friendshipId: string | null;
  requestDirection: FriendRequestDirection | null;
};

type UsersListResponse = {
  success: boolean;
  data: SearchUser[];
  requestId: string;
};

type GetUserByIdResponse = {
  success: boolean;
  data: User;
  requestId: string;
};

export const usersApi = {
  search: async (query: string) => {
    const response = await api.get<UsersListResponse>(
      ENDPOINTS.users.search(query),
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<GetUserByIdResponse>(
      ENDPOINTS.users.detail(id),
    );
    return response.data;
  },
};
