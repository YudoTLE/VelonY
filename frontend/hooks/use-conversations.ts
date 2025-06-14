import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMe } from '@/hooks/use-users';

import { processRawConversations, processRawConversation } from '@/lib/transformers';
import api from '@/lib/axios';

export const useFetchConversations = () => {
  const { data: me } = useMe();

  return useQuery({
    enabled: !!me,
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: conversationsRaw } = await api.get<ConversationRaw[]>('/conversations');
      const conversations = processRawConversations(conversationsRaw, { selfId: me!.id });
      conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      return conversations;
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
        (oldCache?: Conversation[]) => {
          const old: Conversation[] = oldCache ?? [];
          const newConversations = [newConversation, ...old];

          return newConversations;
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

      return deletedConversation;
    },

    onSuccess: (deletedConversation) => {
      queryClient.setQueryData(
        ['conversations'],
        (oldCache?: Conversation[]) => {
          const old: Conversation[] = oldCache ?? [];
          const newConversations = [...old];

          const at = newConversations.findIndex(conversation => conversation.id === deletedConversation.id);
          if (at !== -1) {
            newConversations.splice(at, 1);
          }

          return newConversations;
        },
      );
    },
  });
};

export const useLeaveConversation = () => {
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: deletedConversationRaw } = await api.delete<ConversationRaw>(`/conversations/${conversationId}/participants/self`);
      const deletedConversation = processRawConversation(deletedConversationRaw, { selfId: me.id });

      return deletedConversation;
    },

    onSuccess: (deletedConversation) => {
      queryClient.setQueryData(
        ['conversations'],
        (oldCache?: Conversation[]) => {
          const old: Conversation[] = oldCache ?? [];
          const newConversations = [...old];

          const at = newConversations.findIndex(conversation => conversation.id === deletedConversation.id);
          if (at !== -1) {
            newConversations.splice(at, 1);
          }

          return newConversations;
        },
      );
    },
  });
};
