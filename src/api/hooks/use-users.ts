import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { usersApi } from "@/api/users";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UsersListResponse,
} from "@/api/types";
import { normalizeAxiosError } from "@/utils/errors";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params?: { q?: string }) => [...userKeys.lists(), params ?? {}] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useUsers(
  params?: { q?: string },
  options?: Omit<
    UseQueryOptions<UsersListResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      try {
        return await usersApi.list(params);
      } catch (error) {
        throw normalizeAxiosError(error);
      }
    },
    ...options,
  });
}

export function useUser(
  id: string,
  options?: Omit<UseQueryOptions<User, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      try {
        return await usersApi.getById(id);
      } catch (error) {
        throw normalizeAxiosError(error);
      }
    },
    enabled: Boolean(id),
    ...options,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      try {
        return await usersApi.create(data);
      } catch (error) {
        throw normalizeAxiosError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserRequest;
    }) => {
      try {
        return await usersApi.update(id, data);
      } catch (error) {
        throw normalizeAxiosError(error);
      }
    },
    onSuccess: (user) => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.setQueryData(userKeys.detail(user.id), user);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        return await usersApi.remove(id);
      } catch (error) {
        throw normalizeAxiosError(error);
      }
    },
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
    },
  });
}
