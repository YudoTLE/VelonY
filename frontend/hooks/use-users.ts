import { useQuery } from '@tanstack/react-query';

import { processRawUser } from '@/lib/transformers';
import api from '@/lib/axios';

export const useMe = () => {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: async () => {
      const { data: userRaw } = await api.get<UserRaw>('users/me');
      const user = processRawUser(userRaw);

      return user;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  });
};
