import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useMe } from './use-users';

import { Socket } from 'socket.io-client';
import { Channel } from 'pusher-js';

import { processRawMessage, processRawMessages, processRawConversation } from '@/lib/transformers';
import { getSocket } from '@/lib/socket';
import { getPusherChannel } from '@/lib/pusher';
import api from '@/lib/axios';

type MessageChunkPayload = {
  messageId: Message['id'];
  chunkIndex?: number;
  deltaContent: Message['content'];
  deltaExtra: Message['extra'];
};

type MessageChunkState = {
  nextIndex: number;
  pending: Map<number, MessageChunkPayload>;
};

export const useFetchMessages = (conversationId: string) => {
  const { data: me } = useMe();

  return useQuery({
    enabled: !!me,
    queryKey: ['conversations', conversationId, 'messages'],
    queryFn: async () => {
      const { data: messagesRaw } = await api.get<MessageRaw[]>(`conversations/${conversationId}/messages`);
      const messages = processRawMessages(messagesRaw, { selfId: me!.id });
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
      const newMessage = processRawMessage(newMessageRaw, { selfId: me.id });

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
      const newMessage = processRawMessage(newMessageRaw, { selfId: me.id });

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
      const deletedMessage = processRawMessage(deletedMessageRaw, { selfId: me.id });

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
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  const socketRef = useRef<Socket | null>(null);
  const channelRef = useRef<Channel | null>(null);
  const chunkBuffersRef = useRef<Map<Message['id'], MessageChunkState>>(new Map());
  const completedMessageIdsRef = useRef<Set<Message['id']>>(new Set());

  useEffect(() => {
    if (!me) return;

    const messagesQueryKey = ['conversations', conversationId, 'messages'] as const;

    const getChunkState = (messageId: Message['id']) => {
      const existing = chunkBuffersRef.current.get(messageId);
      if (existing) {
        return existing;
      }

      const nextState: MessageChunkState = {
        nextIndex: 1,
        pending: new Map<number, MessageChunkPayload>(),
      };
      chunkBuffersRef.current.set(messageId, nextState);

      return nextState;
    };

    const appendMessageChunk = async ({
      messageId,
      deltaContent,
      deltaExtra,
    }: MessageChunkPayload) => {
      await queryClient.cancelQueries({ queryKey: messagesQueryKey });

      queryClient.setQueryData(
        messagesQueryKey,
        (oldCache?: Message[]) => {
          const old: Message[] = oldCache || [];
          const newMessages = [...old];

          const at = newMessages.findIndex(message => message.id === messageId);
          if (at !== -1) {
            if (newMessages[at].status !== 'sending') {
              return newMessages;
            }

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
    };

    const flushQueuedMessageChunks = async (messageId: Message['id']) => {
      if (completedMessageIdsRef.current.has(messageId)) return;

      const state = chunkBuffersRef.current.get(messageId);
      if (!state) return;

      const messages = queryClient.getQueryData<Message[]>(messagesQueryKey) ?? [];
      const message = messages.find(m => m.id === messageId);
      if (!message || message.status !== 'sending') return;

      let deltaContent = '';
      let deltaExtra = '';

      while (state.pending.has(state.nextIndex)) {
        const chunk = state.pending.get(state.nextIndex)!;
        deltaContent += chunk.deltaContent;
        deltaExtra += chunk.deltaExtra;
        state.pending.delete(state.nextIndex);
        state.nextIndex += 1;
      }

      if (!deltaContent && !deltaExtra) return;

      await appendMessageChunk({
        messageId,
        deltaContent,
        deltaExtra,
      });
    };

    const receiveMessageChunk = async (chunk: MessageChunkPayload) => {
      const { messageId, chunkIndex } = chunk;

      if (completedMessageIdsRef.current.has(messageId)) return;

      if (!Number.isInteger(chunkIndex) || chunkIndex == null) {
        await appendMessageChunk(chunk);
        return;
      }

      const state = getChunkState(messageId);
      if (chunkIndex < state.nextIndex) return;

      state.pending.set(chunkIndex, chunk);
      await flushQueuedMessageChunks(messageId);
    };

    const receiveMessage = async (newMessageRaw: MessageRaw) => {
      if (newMessageRaw.conversationId !== conversationId) return;

      await queryClient.cancelQueries({ queryKey: messagesQueryKey });

      const newMessage = processRawMessage(newMessageRaw, { selfId: me.id });

      queryClient.setQueryData(
        messagesQueryKey,
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

      if (newMessage.status === 'sending') {
        completedMessageIdsRef.current.delete(newMessage.id);
        getChunkState(newMessage.id);
        await flushQueuedMessageChunks(newMessage.id);
      }
      else {
        completedMessageIdsRef.current.add(newMessage.id);
        chunkBuffersRef.current.delete(newMessage.id);
      }
    };

    const removeMessage = async (deletedMessageRaw: MessageRaw) => {
      if (deletedMessageRaw.conversationId !== conversationId) return;

      await queryClient.cancelQueries({ queryKey: messagesQueryKey });

      queryClient.setQueryData(
        messagesQueryKey,
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

      completedMessageIdsRef.current.add(deletedMessageRaw.id);
      chunkBuffersRef.current.delete(deletedMessageRaw.id);
    };

    switch (process.env.NEXT_PUBLIC_REALTIME_PROVIDER) {
      case 'SOCKETIO': {
        if (!socketRef.current) {
          socketRef.current = getSocket('users');
        }

        socketRef.current.on('receive-message-chunk', receiveMessageChunk);
        socketRef.current.on('receive-message', receiveMessage);
        socketRef.current.on('remove-message', removeMessage);

        return () => {
          socketRef.current?.off('receive-message-chunk', receiveMessageChunk);
          socketRef.current?.off('receive-message', receiveMessage);
          socketRef.current?.off('remove-message', removeMessage);
        };
      }

      case 'PUSHER': {
        if (!channelRef.current) {
          channelRef.current = getPusherChannel('users', me.id);
        }

        channelRef.current.bind('receive-message-chunk', receiveMessageChunk);
        channelRef.current.bind('receive-message', receiveMessage);
        channelRef.current.bind('remove-message', removeMessage);

        return () => {
          channelRef.current?.unbind('receive-message-chunk', receiveMessageChunk);
          channelRef.current?.unbind('receive-message', receiveMessage);
          channelRef.current?.unbind('remove-message', removeMessage);
        };
      }

      default:
        return () => {};
    }
  }, [conversationId, queryClient, me, socketRef, channelRef]);
};
