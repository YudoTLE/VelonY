import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMe } from '@/hooks/use-users';

import { processRawAgent, processRawAgents } from '@/lib/transformers';
import api from '@/lib/axios';

export const useFetchAgents = () => {
  const { data: me } = useMe();

  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: agentsRaw } = await api.get<AgentRaw[]>('agents');
      const agents = processRawAgents(agentsRaw, { selfId: me.id });
      agents.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      return agents;
    },
    staleTime: 1000 * 60 * 5,
  });
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
      queryClient.setQueryData(
        ['agent', agentId],
        () => updatedAgent,
      );
      queryClient.setQueryData(
        ['agents'],
        (oldCache?: Agent[]) => {
          const old: Agent[] = oldCache || [];
          const newAgents = [...old];

          const at = newAgents.findIndex(agent => agent.id === updatedAgent.id);
          if (at !== -1) {
            newAgents[at] = updatedAgent;
          }

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
      queryClient.setQueryData(
        ['agents'],
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

export const useFetchAgentById = (agentId: string) => {
  const { data: me } = useMe();

  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: agentRaw } = await api.get<AgentRaw>(`agents/${agentId}`);
      const agent = processRawAgent(agentRaw, { selfId: me.id });

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
      queryClient.setQueryData(
        ['agent', agentId],
        () => updatedAgent,
      );
      queryClient.setQueryData(
        ['agents'],
        (oldCache?: Agent[]) => {
          const old: Agent[] = oldCache ?? [];
          const newAgents = [...old];

          const at = newAgents.findIndex(agent => agent.id === updatedAgent.id);
          if (at !== -1) {
            newAgents[at] = updatedAgent;
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
