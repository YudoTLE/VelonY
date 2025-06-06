declare global {
  type UserData = {
    email: string
    name: string
    avatarUrl: string
  };

  type UserRaw = UserData & {
    id: string

    createdAt: string
    updatedAt: string
  };

  type User = UserData & {
    id: string

    createdAt: Date
    updatedAt: Date
  };
}

export {};
