import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useMe } from './use-users';

import { processRawMessage, processRawMessages, processRawConversation } from '@/lib/transformers';
import { getSocket } from '@/lib/socket';
import api from '@/lib/axios';

export const useFetchMessages = (conversationId: string) => {
  const { data: me } = useMe();

  return useQuery({
    enabled: !!me,
    queryKey: ['conversations', conversationId, 'messages'],
    queryFn: async () => {
      const { data: messagesRaw } = await api.get<MessageRaw[]>(`conversations/${conversationId}/messages`);
      const messages = processRawMessages(messagesRaw, { selfId: me!.id, status: 'sent' });
      messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      return messages;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

export const useSendMessageByConversation = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  const createOptimisticMessage = (
    content: string,
    conversationId: string,
  ): Message => {
    const now = new Date();
    const tempId = `t-${crypto.randomUUID()}`;

    return {
      id: tempId,
      conversationId,
      type: 'user',
      content,
      extra: '',
      senderName: 'You',
      senderAvatar: '',
      agentName: '',
      modelName: '',
      status: 'sending',
      isOwn: true,
      initial: '',
      createdAt: now,
      updatedAt: now,
    };
  };

  return useMutation({
    mutationFn: async (payload: MessageData) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: newMessageRaw } = await api.post<MessageRaw>(`/conversations/${conversationId}/messages`, payload);
      const newMessage = processRawMessage(newMessageRaw, { selfId: me.id, status: 'sent' });

      return newMessage;
    },

    onMutate: async (payload) => {
      const { content, type } = payload;

      if (type !== 'user') return;

      await queryClient.cancelQueries({ queryKey: ['conversations', conversationId, 'messages'] });
      const prevCache = queryClient.getQueryData(['conversations', conversationId, 'messages']);

      const newMessageTemp = createOptimisticMessage(content, conversationId);

      queryClient.setQueryData(
        ['conversations', conversationId, 'messages'],
        (oldCache?: Message[]) => {
          const old: Message[] = oldCache ?? [];
          const newMessages = [...old, newMessageTemp];

          return newMessages;
        },
      );
      queryClient.setQueryData(
        ['conversations', conversationId, 'latest-receive'],
        () => ({ isOwn: true, time: new Date() }),
      );

      return { prevCache, newMessageTemp };
    },

    onError: (err, variables, context) => {
      if (context?.prevCache) {
        queryClient.setQueryData(['conversations', conversationId, 'messages'], context.prevCache);
      }
    },

    onSuccess: (newMessage, variables, context) => {
      const tempId = newMessage.type === 'user' ? context.newMessageTemp.id : newMessage.id;

      queryClient.setQueryData(
        ['conversations', conversationId, 'messages'],
        (oldCache?: Message[]) => {
          const old: Message[] = oldCache ?? [];
          const newMessages = [...old];

          const at = newMessages.findIndex(message => message.id === tempId);
          if (at === -1) {
            newMessages.push(newMessage);
          }
          else {
            newMessages[at] = newMessage;
          }

          return newMessages;
        },
      );
    },
  });
};

export const useSendMessageByNewConversation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  return useMutation({
    mutationFn: async (payload: MessageData) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: newConversationRaw } = await api.post<ConversationRaw>('/conversations',
        { title: payload.content, type: 'default' });
      const newConversation = processRawConversation(newConversationRaw, { selfId: me.id });

      const { data: newMessageRaw } = await api.post<MessageRaw>(`/conversations/${newConversation.id}/messages`, payload);
      const newMessage = processRawMessage(newMessageRaw, { selfId: me.id, status: 'sent' });

      return { newMessage, newConversation };
    },

    onSuccess: ({ newMessage, newConversation }) => {
      queryClient.setQueryData(
        ['conversations', newConversation.id, 'messages'],
        (oldCache?: Message[]) => {
          const old: Message[] = oldCache ?? [];
          const newMessages = [...old, newMessage];

          return newMessages;
        },
      );
      queryClient.setQueryData(
        ['conversations'],
        (oldCache?: Conversation[]) => {
          const old: Conversation[] = oldCache ?? [];
          const newConversations = [newConversation, ...old];

          return newConversations;
        },
      );

      router.push(newConversation.url);
    },
  });
};

export const useDeleteMessage = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  return useMutation({
    mutationFn: async (messageId: string) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: deletedMessageRaw } = await api.delete<MessageRaw>(`/messages/${messageId}`);
      const deletedMessage = processRawMessage(deletedMessageRaw, { selfId: me.id, status: 'deleted' });

      return deletedMessage;
    },

    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: ['conversations', conversationId, 'messages'] });

      queryClient.setQueryData(
        ['conversations', conversationId, 'messages'],
        (oldCache?: Message[]) => {
          const old: Message[] = oldCache ?? [];
          const newMessages = [...old];

          const at = newMessages.findIndex(message => message.id === messageId);
          if (at !== -1) {
            newMessages[at].status = 'deleting';
          }

          return newMessages;
        },
      );
    },
  });
};

export const useRealtimeSyncMessages = (conversationId: string) => {
  const socket = getSocket('users');
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  useEffect(() => {
    if (!me) {
      return;
      throw new Error('Unauthenticated');
    }

    const receiveMessageChunk = async (
      { messageId, deltaContent, deltaExtra }:
      { messageId: Message['id'], deltaContent: Message['content'], deltaExtra: Message['extra'] }) => {
      await queryClient.cancelQueries({ queryKey: ['conversations', conversationId, 'messages'] });

      queryClient.setQueryData(
        ['conversations', conversationId, 'messages'],
        (oldCache?: Message[]) => {
          const old: Message[] = oldCache || [];
          const newMessages = [...old];

          const at = newMessages.findIndex(message => message.id === messageId);
          if (at !== -1) {
            newMessages[at] = {
              ...newMessages[at],
              content: newMessages[at].content + deltaContent,
              extra: newMessages[at].extra + deltaExtra,
              status: 'sending',
            };
          }

          return newMessages;
        },
      );
      queryClient.setQueryData(
        ['conversations', conversationId, 'latest-receive'],
        () => ({ isOwn: false, time: new Date() }),
      );
    };

    const receiveMessage = async (newMessageRaw: MessageRaw) => {
      await queryClient.cancelQueries({ queryKey: ['conversations', conversationId, 'messages'] });

      const newMessage = processRawMessage(newMessageRaw, { selfId: me.id, status: 'sent' });

      queryClient.setQueryData(
        ['conversations', conversationId, 'messages'],
        (oldCache?: Message[]) => {
          const old: Message[] = oldCache || [];
          const newMessages = [...old];

          const at = newMessages.findIndex(message => message.id === newMessage.id);
          if (at === -1) {
            newMessages.push(newMessage);
          }
          else {
            newMessages[at] = newMessage;
          }

          return newMessages;
        },
      );
      queryClient.setQueryData(
        ['conversations', conversationId, 'latest-receive'],
        () => ({ isOwn: false, time: new Date() }),
      );
    };

    const removeMessage = async (deletedMessageRaw: MessageRaw) => {
      await queryClient.cancelQueries({ queryKey: ['conversations', conversationId, 'messages'] });

      queryClient.setQueryData(
        ['conversations', conversationId, 'messages'],
        (oldCache?: Message[]) => {
          const old: Message[] = oldCache || [];
          const newMessages = [...old];

          const at = newMessages.findIndex(message => message.id === deletedMessageRaw.id);
          if (at !== -1) {
            newMessages.splice(at, 1);
          }

          return newMessages;
        },
      );
    };

    socket.on('receive-message-chunk', receiveMessageChunk);
    socket.on('receive-message', receiveMessage);
    socket.on('remove-message', removeMessage);
    return () => {
      socket.off('receive-message-chunk', receiveMessageChunk);
      socket.off('receive-message', receiveMessage);
      socket.off('remove-message', removeMessage);
    };
  }, [conversationId, queryClient, me, socket]);
};

export const useLatestReceivedMessageTime = (conversationId: string) => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<{ isOwn: boolean, time: Date }>(['conversations', conversationId, 'latest-receive']) ?? undefined;
};
