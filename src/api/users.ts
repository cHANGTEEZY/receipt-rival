import { api } from "@/lib/api-client";
import { ENDPOINTS } from "@/api/endpoints";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UsersListResponse,
} from "@/api/types";

export const usersApi = {
  list: async (params?: { q?: string }) => {
    const response = await api.get<UsersListResponse>(ENDPOINTS.users.list, {
      params,
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<User>(ENDPOINTS.users.detail(id));
    return response.data;
  },

  create: async (data: CreateUserRequest) => {
    const response = await api.post<User>(ENDPOINTS.users.create, data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserRequest) => {
    const response = await api.patch<User>(ENDPOINTS.users.update(id), data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete<void>(ENDPOINTS.users.delete(id));
    return response.data;
  },
};
