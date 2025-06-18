import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMe } from '@/hooks/use-users';

import { processRawAgent, processRawAgents } from '@/lib/transformers';
import api from '@/lib/axios';

export const useFetchAgents = (query = '') => {
  const { data: me } = useMe();

  const resolvedQuery = query.replaceAll('<me>', me?.id || '');

  return useQuery({
    enabled: !!me,
    queryKey: ['agents', resolvedQuery],
    queryFn: async () => {
      const { data: agentsRaw } = await api.get<AgentRaw[]>(`agents?${resolvedQuery}`);
      const agents = processRawAgents(agentsRaw, { selfId: me!.id });
      agents.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      return agents;
    },
    staleTime: 1000 * 60 * 5,
  });
};
export const useFetchDefaultAgents = () => useFetchAgents('visibility=default');
export const useFetchSubscribedAgents = () => useFetchAgents('subscriberId=<me>');
export const useFetchPrivateAgents = () => useFetchAgents('creatorId=<me>');
export const useFetchPublicAgents = () => useFetchAgents('visibility=public');
export const useFetchAllMyAgents = () => {
  const defaultAgents = useFetchDefaultAgents();
  const subscribedAgents = useFetchSubscribedAgents();
  const privateAgents = useFetchPrivateAgents();

  const isPending
    = defaultAgents.isPending
      || subscribedAgents.isPending
      || privateAgents.isPending;

  const isError
    = defaultAgents.isError
      || subscribedAgents.isError
      || privateAgents.isError;

  const data = useMemo(() => {
    const all = [
      ...(defaultAgents.data ?? []),
      ...(subscribedAgents.data ?? []),
      ...(privateAgents.data ?? []),
    ];

    const unique = new Map();
    for (const model of all) {
      unique.set(model.id, model);
    }

    return Array.from(unique.values());
  }, [defaultAgents.data, subscribedAgents.data, privateAgents.data]);

  return {
    data,
    isPending,
    isError,
  };
};

export const useUpdateAgentById = (agentId: string) => {
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  return useMutation({
    mutationFn: async (payload: Partial<AgentData>) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: updatedAgentRaw } = await api.patch<AgentRaw>(`agents/${agentId}`, payload);
      const updatedAgent = processRawAgent(updatedAgentRaw, { selfId: me.id });

      return updatedAgent;
    },

    onSuccess: (updatedAgent) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      queryClient.setQueryData(
        ['agent', agentId],
        () => updatedAgent,
      );
      queryClient.setQueryData(
        ['agents', `creatorId=${me.id}`],
        (oldCache?: Agent[]) => {
          const old: Agent[] = oldCache || [];
          const newAgents = [...old];

          const at = newAgents.findIndex(agent => agent.id === updatedAgent.id);
          if (at !== -1) {
            newAgents.splice(at, 1);
          }
          newAgents.unshift(updatedAgent);

          return newAgents;
        },
      );
    },
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: me } = useMe();

  return useMutation({
    mutationFn: async (payload: Required<AgentData>) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: newAgentRaw } = await api.post<AgentRaw>('agents', payload);
      const newAgent = processRawAgent(newAgentRaw, { selfId: me.id });

      return newAgent;
    },

    onSuccess: (data) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      queryClient.setQueryData(
        ['agents', `creatorId=${me.id}`],
        (oldCache?: Agent[]) => {
          const old: Agent[] = oldCache || [];
          const newAgents = [data, ...old];

          return newAgents;
        },
      );

      router.push(data.url);
    },
  });
};

export const useDeleteAgentById = (agentId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  return useMutation({
    mutationFn: async () => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: deletedAgentRaw } = await api.delete<AgentRaw>(`agents/${agentId}`);
      const deletedAgent = processRawAgent(deletedAgentRaw, { selfId: me.id });

      return deletedAgent;
    },

    onSuccess: (deletedAgent) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      queryClient.setQueryData(
        ['agents', `creatorId=${me.id}`],
        (oldCache?: Agent[]) => {
          const old: Agent[] = oldCache || [];
          const newAgents = [...old];

          const at = newAgents.findIndex(m => m.id === deletedAgent.id);
          if (at !== -1) {
            newAgents.splice(at, 1);
          }

          return newAgents;
        },
      );

      router.push('/');
    },
  });
};

export const useFetchAgentById = (agentId: string) => {
  const { data: me } = useMe();

  return useQuery({
    enabled: !!me,
    queryKey: ['agent', agentId],
    queryFn: async () => {
      const { data: agentRaw } = await api.get<AgentRaw>(`agents/${agentId}`);
      const agent = processRawAgent(agentRaw, { selfId: me!.id });

      return agent;
    },
    staleTime: 1000 * 60,
  });
};

export const useToggleAgentSubscriptionById = (agentId: string) => {
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  return useMutation({
    mutationFn: async (subscribe: boolean) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: updatedAgentRaw } = subscribe
        ? await api.post<AgentRaw>(`agents/${agentId}/subscribers/self`)
        : await api.delete<AgentRaw>(`agents/${agentId}/subscribers/self`);
      const updatedAgent = processRawAgent(updatedAgentRaw, { selfId: me.id });

      return updatedAgent;
    },
    onSuccess: (updatedAgent) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      queryClient.setQueryData(
        ['agent', agentId],
        () => updatedAgent,
      );
      queryClient.setQueryData(
        ['agents', `subscriberId=${me.id}`],
        (oldCache?: Agent[]) => {
          const old: Agent[] = oldCache ?? [];
          const newAgents = [...old];

          const at = newAgents.findIndex(agent => agent.id === updatedAgent.id);
          if (at !== -1) {
            newAgents.splice(at, 1);
          }
          else {
            newAgents.unshift(updatedAgent);
          }

          return newAgents;
        },
      );
    },
  });
};
