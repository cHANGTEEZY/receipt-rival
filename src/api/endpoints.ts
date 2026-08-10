const BASE_URL_ADD_ON = "/api/v1";

export const ENDPOINTS = {
  users: {
    detail: (id: string) => `${BASE_URL_ADD_ON}/users/${id}`,
    search: (query: string) => `${BASE_URL_ADD_ON}/users/search?query=${query}`,
  },

  payments: {
    create: `${BASE_URL_ADD_ON}/payments`,
    list: `${BASE_URL_ADD_ON}/payments`,
    detail: (paymentId: string) => `${BASE_URL_ADD_ON}/payments/${paymentId}`,
    finalize: (paymentId: string) =>
      `${BASE_URL_ADD_ON}/payments/${paymentId}/finalize`,
    items: (paymentId: string) =>
      `${BASE_URL_ADD_ON}/payments/${paymentId}/items`,
    participants: (paymentId: string) =>
      `${BASE_URL_ADD_ON}/payments/${paymentId}/participants`,
    splits: {
      list: (paymentId: string) =>
        `${BASE_URL_ADD_ON}/payments/${paymentId}/splits`,
      createEqual: (paymentId: string) =>
        `${BASE_URL_ADD_ON}/payments/${paymentId}/splits/equal`,
      createItemBased: (paymentId: string) =>
        `${BASE_URL_ADD_ON}/payments/${paymentId}/splits/item-based`,
      createPercentage: (paymentId: string) =>
        `${BASE_URL_ADD_ON}/payments/${paymentId}/splits/percentage`,
      createCustom: (paymentId: string) =>
        `${BASE_URL_ADD_ON}/payments/${paymentId}/splits/custom`,
    },
  },

  splits: {
    detail: (splitId: string) => `${BASE_URL_ADD_ON}/splits/${splitId}`,
  },

  me: {
    payments: `${BASE_URL_ADD_ON}/me/payments`,
    splitsOwedByMe: `${BASE_URL_ADD_ON}/me/splits/owed-by-me`,
    splitsOwedToMe: `${BASE_URL_ADD_ON}/me/splits/owed-to-me`,
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
