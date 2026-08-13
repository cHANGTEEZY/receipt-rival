import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { usersApi, type AvatarUpload } from "../users";

export const USERS_QUERY_KEYS = {
  search: (query: string) => ["users", "search", query] as const,
  getById: (id: string) => ["users", "getById", id] as const,
  me: ["users", "me"] as const,
};

export const useUsersSearch = (query: string) => {
  return useQuery({
    queryKey: USERS_QUERY_KEYS.search(query),
    queryFn: () => usersApi.search(query),
    enabled: !!query,
  });
};

export const useUserById = (id: string) => {
  return useQuery({
    queryKey: USERS_QUERY_KEYS.getById(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: USERS_QUERY_KEYS.me,
    queryFn: usersApi.getMe,
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => usersApi.updateMe(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.me });
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (image: AvatarUpload) => usersApi.uploadAvatar(image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
