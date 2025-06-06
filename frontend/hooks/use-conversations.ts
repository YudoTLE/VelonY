import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useMe } from './use-users';

import { processRawConversations, processRawConversation } from '@/lib/transformers';
import { getSocket } from '@/lib/socket';
import api from '@/lib/axios';

export const useFetchConversations = () => {
  const { data: me } = useMe();

  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: conversationsRaw } = await api.get('/conversations');

      const list = processRawConversations(conversationsRaw, { selfId: me.id });
      const registry = new Map<string, Conversation>();

      list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      for (const conversation of list) {
        registry.set(conversation.id, conversation);
      }

      return {
        list,
        registry,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  return useMutation({
    mutationFn: async (payload: ConversationData) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: newConversationRaw } = await api.post('/conversations', payload);
      const newConversation = processRawConversation(newConversationRaw, { selfId: me.id });

      return { newConversation };
    },

    onSuccess: ({ newConversation }) => {
      queryClient.setQueryData(
        ['conversations'],
        (oldCache?: ConversationCache) => {
          const old: ConversationCache = oldCache ?? {
            list: [],
            registry: new Map(),
          };

          const newList = [newConversation, ...old.list];
          const newRegistry = new Map(old.registry);

          newRegistry.set(newConversation.id, newConversation);

          return {
            list: newList,
            registry: newRegistry,
          };
        },
      );
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: deletedConversationRaw } = await api.delete<ConversationRaw>(`/conversations/${conversationId}`);
      const deletedConversation = processRawConversation(deletedConversationRaw, { selfId: me.id });

      return { deletedConversation };
    },

    onSuccess: ({ deletedConversation }) => {
      queryClient.setQueryData(
        ['conversations'],
        (oldCache?: ConversationCache) => {
          const old: ConversationCache = oldCache ?? {
            list: [],
            registry: new Map(),
          };

          const newList = [...old.list];
          const newRegistry = new Map(old.registry);

          const at = newList.findIndex(conversation => conversation.id === deletedConversation.id);
          if (at !== -1) {
            newList.splice(at, 1);
          }
          newRegistry.delete(deletedConversation.id);

          return {
            list: newList,
            registry: newRegistry,
          };
        },
      );
    },
  });
};

export const useRealtimeSyncConversations = () => {
  const socket = getSocket('users');
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  useEffect(() => {
    if (!me) {
      return;
      throw new Error('Unauthenticated');
    }

    const receiveMessage = async (newMessageRaw: MessageRaw) => {
      await queryClient.cancelQueries({ queryKey: ['conversations'] });

      queryClient.setQueryData(
        ['conversations'],
        (oldCache?: ConversationCache) => {
          const old: ConversationCache = oldCache ?? {
            list: [],
            registry: new Map(),
          };

          const newList = [...old.list];
          const newRegistry = new Map(old.registry);

          const at = old.list.findIndex(conversation => conversation.id === newMessageRaw.conversationId);
          if (at !== -1) {
            const updatedConversation = newList.splice(at, 1)[0];
            // things in registry will get updated as well since the object remains the same
            updatedConversation.updatedAt = new Date(newMessageRaw.updatedAt);
            newList.unshift(updatedConversation);
          }

          return {
            list: newList,
            registry: newRegistry,
          };
        },
      );
    };

    socket.on('receive-message', receiveMessage);
    return () => {
      socket.off('receive-message', receiveMessage);
    };
  }, [me, queryClient, socket]);
};
