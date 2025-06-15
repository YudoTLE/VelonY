import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMe } from '@/hooks/use-users';

import { processRawConversations, processRawConversation } from '@/lib/transformers';
import api from '@/lib/axios';

export const useFetchConversations = (query = '') => {
  const { data: me } = useMe();

  const resolvedQuery = query.replaceAll('<me>', me?.id || '').trim();

  return useQuery({
    enabled: !!me,
    queryKey: resolvedQuery ? ['conversations', resolvedQuery] : ['conversations'],
    queryFn: async () => {
      const { data: conversationsRaw } = await api.get<ConversationRaw[]>(`/conversations?${resolvedQuery}`);
      const conversations = processRawConversations(conversationsRaw, { selfId: me!.id });
      conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      return conversations;
    },
    staleTime: 1000 * 60 * 3,
  });
};

export const useFetchConversationsById = (conversationId: string) => {
  const { data: me } = useMe();

  return useQuery({
    enabled: !!me,
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const { data: conversationRaw } = await api.get<ConversationRaw>(`/conversations/${conversationId}`);
      const conversation = processRawConversation(conversationRaw, { selfId: me!.id });

      return conversation;
    },
    staleTime: 1000 * 60 * 1,
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

export const useDeleteConversationById = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
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

      router.push('/');
    },
  });
};

export const useExitConversationById = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: exitedConversationRaw } = await api.delete<ConversationRaw>(`/conversations/${conversationId}/participants/${me.id}`);
      const exitedConversation = processRawConversation(exitedConversationRaw, { selfId: me.id });

      return exitedConversation;
    },

    onSuccess: (exitedConversation) => {
      queryClient.setQueryData(
        ['conversations'],
        (oldCache?: Conversation[]) => {
          const old: Conversation[] = oldCache ?? [];
          const newConversations = [...old];

          const at = newConversations.findIndex(c => c.id === exitedConversation.id);
          if (at !== -1) {
            newConversations.splice(at, 1);
          }

          return newConversations;
        },
      );

      router.push('/');
    },
  });
};

export const useJoinConversation = () => {
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const router = useRouter();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: joinedConversationRaw } = await api.post<ConversationRaw>(`/conversations/${conversationId}/participants/self`);
      const joinedConversation = processRawConversation(joinedConversationRaw, { selfId: me.id });

      return joinedConversation;
    },

    onSuccess: (joinedConversation) => {
      queryClient.setQueryData(
        ['conversations'],
        (oldCache?: Conversation[]) => {
          const old: Conversation[] = oldCache ?? [];
          const newConversations = [joinedConversation, ...old];

          return newConversations;
        },
      );

      router.push(joinedConversation.url);
    },
  });
};
