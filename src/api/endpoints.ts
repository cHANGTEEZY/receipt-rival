export const ENDPOINTS = {
  users: {
    list: "/users",
    detail: (id: string) => `/users/${id}`,
    create: "/users",
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },

  splits: {
    list: "/splits",
    detail: (id: string) => `/splits/${id}`,
    create: "/splits",
    update: (id: string) => `/splits/${id}`,
    delete: (id: string) => `/splits/${id}`,
  },
} as const;
