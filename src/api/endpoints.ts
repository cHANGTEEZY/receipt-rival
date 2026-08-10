const BASE_URL_ADD_ON = "/api/v1";

export const ENDPOINTS = {
  users: {
    detail: (id: string) => `${BASE_URL_ADD_ON}/users/${id}`,
    search: (query: string) => `${BASE_URL_ADD_ON}/users/search?query=${query}`,
  },

  splits: {
    list: "/splits",
    detail: (id: string) => `${BASE_URL_ADD_ON}/splits/${id}`,
    create: "/splits",
    update: (id: string) => `${BASE_URL_ADD_ON}/splits/${id}`,
    delete: (id: string) => `${BASE_URL_ADD_ON}/splits/${id}`,
  },

  friends: {
    list: `${BASE_URL_ADD_ON}/friends`,
    listIncomingRequests: `${BASE_URL_ADD_ON}/friends/requests`,
    sendFriendRequest: `${BASE_URL_ADD_ON}/friends/requests`,
    acceptFriendRequest: (friendShipId: string) =>
      `${BASE_URL_ADD_ON}/friends/requests/${friendShipId}/accept`,
    cancelFriendRequest: (friendShipId: string) =>
      `${BASE_URL_ADD_ON}/friends/requests/${friendShipId}/cancel`,
    rejectFriendRequest: (friendShipId: string) =>
      `${BASE_URL_ADD_ON}/friends/requests/${friendShipId}/reject`,
    removeFriend: (friendUserId: string) =>
      `${BASE_URL_ADD_ON}/friends/${friendUserId}`,
  },
} as const;
