export type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateUserRequest = {
  name: string;
  email: string;
};

export type UpdateUserRequest = {
  name?: string;
  email?: string;
  image?: string | null;
};

export type UsersListResponse = {
  users: User[];
};
