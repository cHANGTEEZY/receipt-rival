import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../users";

export const USERS_QUERY_KEYS = {
  search: (query: string) => ["users", "search", query],
  getById: (id: string) => ["users", "getById", id],
} as const;

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
