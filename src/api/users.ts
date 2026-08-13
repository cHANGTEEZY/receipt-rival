import { api } from "@/lib/api-client";
import { normalizeAxiosError } from "@/utils/errors";

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

export function publicImageUrl(image?: string | null): string | undefined {
  return image?.includes("://") ? image : undefined;
}

export type AvatarUpload = {
  uri: string;
  fileName?: string;
  mimeType?: string;
};

export type FriendRequestStatus = null | "pending" | "accepted";
export type FriendRequestDirection = "sent" | "received";

export type SearchUser = User & {
  friendRequestStatus: FriendRequestStatus;
  friendshipId: string | null;
  requestDirection: FriendRequestDirection | null;
};

type ApiSuccess<T> = {
  success: true;
  data: T;
  requestId: string;
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

async function unwrap<T>(request: Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  try {
    const response = await request;
    return response.data.data;
  } catch (error) {
    throw normalizeAxiosError(error);
  }
}

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

  getMe: () => unwrap(api.get<ApiSuccess<User>>(ENDPOINTS.users.me)),

  updateMe: (name: string) =>
    unwrap(api.patch<ApiSuccess<User>>(ENDPOINTS.users.me, { name })),

  uploadAvatar: async (image: AvatarUpload) => {
    const formData = new FormData();
    formData.append("avatar", {
      uri: image.uri,
      name: image.fileName ?? "avatar.jpg",
      type: image.mimeType ?? "image/jpeg",
    } as unknown as Blob);

    try {
      const response = await api.post<ApiSuccess<User>>(
        ENDPOINTS.users.avatar,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          transformRequest: [
            (data, headers) => {
              if (data instanceof FormData) {
                delete headers["Content-Type"];
              }
              return data;
            },
          ],
        },
      );
      return response.data.data;
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  },
};
