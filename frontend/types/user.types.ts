export type UserData = {
  email: string
  name: string
  avatarUrl: string
};

export type UserRaw = UserData & {
  id: string

  createdAt: string
  updatedAt: string
};

export type User = UserData & {
  id: string

  createdAt: Date
  updatedAt: Date
};

export const processRawUser = (
  raw: UserRaw,
): User => {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
};

export const processRawUsers = (
  raws: UserRaw[],
): User[] => {
  return raws.map(user => processRawUser(user));
};
