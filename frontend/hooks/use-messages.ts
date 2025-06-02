import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useMe } from './use-users'
import { MessageData, Message, MessageCache, processRawMessage, processRawMessages, createOptimisticMessage, MessageRaw } from '@/types/message.types'
import { ConversationCache, processRawConversation, ConversationRaw } from '@/types/conversation.types'

import { getSocket } from '@/lib/socket'
import api from '@/lib/axios'

export const useFetchMessages = (conversationId: string) => {
  const router = useRouter() 
  const { data: me } = useMe()

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!me) {
        throw new Error('Unauthenticated')
      }

      const { data } = await api.get<MessageRaw[]>(`conversations/${conversationId}/messages`)

      const list = processRawMessages(data, { selfId: me.id, status: 'sent' })
      const registry = new Map<string, Message>()
      
      for (const message of list) {
        registry.set(message.id, message)
      }

      return {
        list,
        registry,
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  })

  useEffect(() => {
    if (query.isError && query.failureCount >= 2) {
      router.push('/')
    }
  }, [query.isError, query.failureCount, router])

  return query
}

export const useSendMessageByConversation = (conversationId: string) => {
  const queryClient = useQueryClient()
  const { data: me } = useMe()

  return useMutation({
    mutationFn: async (payload: MessageData) => {
      if (!me) {
        throw new Error('Unauthenticated')
      }

      const { data: newMessageRaw } = await api.post<MessageRaw>(`/conversations/${conversationId}/messages`, payload)
      const newMessage = processRawMessage(newMessageRaw, { selfId: me.id, status: 'sent' })
  
      return { newMessage }
    },

    onMutate: async (payload) => {
      const { content, type } = payload

      if (type !== 'user') return
      
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] })
      const prevCache = queryClient.getQueryData(['messages', conversationId])

      const newMessageTemp = createOptimisticMessage(content, conversationId)

      queryClient.setQueryData(
        ['messages', conversationId],
        ((oldCache?: MessageCache) => {
          const old: MessageCache = oldCache ?? {
            list: [],
            registry: new Map(),
          }
        
          const newList = [...old.list, newMessageTemp]
          const newRegistry = new Map(old.registry)

          newRegistry.set(newMessageTemp.id, newMessageTemp)
        
          return {
            list: newList,
            registry: newRegistry,
          }
        })
      )
      queryClient.setQueryData(
        ['messages', conversationId, 'latest-added'],
        () => {
          return newMessageTemp
        }
      )

      return { prevCache, newMessageTemp }
    },

    onError: (err, variables, context) => {
      if (context?.prevCache) {
        queryClient.setQueryData(['messages', conversationId], context.prevCache);
      }
    },

    onSuccess: ({ newMessage }, variables, context) => {
      queryClient.setQueryData(
        ['messages', conversationId],
        ((oldCache?: MessageCache) => {
          const old: MessageCache = oldCache ?? {
            list: [],
            registry: new Map(),
          }

          const newList = [...old.list]
          const newRegistry = new Map(old.registry)

          const at = newList.findIndex(message => message.id === context.newMessageTemp.id)
          if (at === -1) {
            newList.push(newMessage)
            newRegistry.set(newMessage.id, newMessage)
          } else {
            newList[at] = newMessage
            newRegistry.delete(context.newMessageTemp.id)
            newRegistry.set(newMessage.id, newMessage)
          }

          return {
            list: newList,
            registry: newRegistry,
          }
        })
      )
    }
  })
}

export const useSendMessageByNewConversation = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: me } = useMe()

  return useMutation({
    mutationFn: async (payload: MessageData) => {
      if (!me) {
        throw new Error('Unauthenticated')
      }

      const { data: newConversationRaw } = await api.post<ConversationRaw>(`/conversations`, { title: payload.content })
      const newConversation = processRawConversation(newConversationRaw, { selfId: me.id })

      const { data: newMessageRaw } = await api.post<MessageRaw>(`/conversations/${newConversation.id}/messages`, payload)
      const newMessage = processRawMessage(newMessageRaw, { selfId: me.id, status: 'sent' })
      
      return { newMessage, newConversation }
    },

    onSuccess: ({ newMessage, newConversation}) => {
      queryClient.setQueryData(
        ['messages', newConversation.id],
        ((oldCache?: MessageCache) => {
          const old: MessageCache = oldCache ?? {
            list: [],
            registry: new Map(),
          }

          const newList = [...old.list, newMessage]
          const newRegistry = new Map(old.registry)
          
          newRegistry.set(newMessage.id, newMessage)

          return {
            list: newList,
            registry: newRegistry,
          }
        })
      )
      queryClient.setQueryData(
        ['conversations'],
        ((oldCache?: ConversationCache) => {
          const old: ConversationCache = oldCache ?? {
            list: [],
            registry: new Map(),
          }

          const newList = [newConversation, ...old.list]
          const newRegistry = new Map(old.registry)
          
          newRegistry.set(newConversation.id, newConversation)

          return {
            list: newList,
            registry: newRegistry,
          }
        })
      )

      router.push(newConversation.url)
    }
  })
}

export const useDeleteMessage = (conversationId: string) => {
  const queryClient = useQueryClient()
  const { data: me } = useMe()

  return useMutation({
    mutationFn: async (messageId: string) => {
      if (!me) {
        throw new Error('Unauthenticated')
      }

      const { data: deletedMessageRaw } = await api.delete<MessageRaw>(`/messages/${messageId}`)
      const deletedMessage = processRawMessage(deletedMessageRaw, { selfId: me.id, status: 'deleted' })

      return { deletedMessage }
    },

    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] })

      queryClient.setQueryData(
        ['messages', conversationId],
        ((oldCache?: MessageCache) => {
          const old: MessageCache = oldCache ?? {
            list: [],
            registry: new Map(),
          }
        
          const newList = [...old.list]
          const newRegistry = new Map(old.registry)

          const updatedMessage = newRegistry.get(messageId)
          if (updatedMessage) {
            updatedMessage.status = 'deleting'
          }
        
          return {
            list: newList,
            registry: newRegistry,
          }
        })
      )
    }
  })
}

export const useRealtimeSyncMessages = (conversationId: string) => {
  const socket = getSocket('users')
  const queryClient = useQueryClient()
  const { data: me } = useMe()

  useEffect(() => {
    if (!me) {
      return
      throw new Error('Unauthenticated')
    }

    const receiveMessageChunk = async (
      { messageId, deltaContent, deltaExtra }:
      { messageId: Message['id'], deltaContent: Message['content'], deltaExtra: Message['extra'] }) => {
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] })

      let updatedMessage: Message | undefined
      queryClient.setQueryData(
        ['messages', conversationId],
        ((oldCache?: MessageCache) => {
          const old: MessageCache = oldCache || {
            list: [],
            registry: new Map(),
          }

          const newList = [...old.list]
          const newRegistry = new Map(old.registry)
          
          updatedMessage = newRegistry.get(messageId)
          if (updatedMessage !== undefined) {
            updatedMessage.content += deltaContent
            updatedMessage.extra += deltaExtra
          }

          return {
            list: newList,
            registry: newRegistry,
          }
        })
      )
      // queryClient.setQueryData(
      //   ['messages', conversationId, 'latest-added'],
      //   () => {
      //     return updatedMessage
      //   }
      // )
    }

    const receiveMessage = async (newMessageRaw: MessageRaw) => {
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] })
      
      const newMessage = processRawMessage(newMessageRaw, { selfId: me.id, status: 'sent' })

      queryClient.setQueryData(
        ['messages', conversationId],
        ((oldCache?: MessageCache) => {
          const old: MessageCache = oldCache || {
            list: [],
            registry: new Map(),
          }

          const newList = [...old.list]
          const newRegistry = new Map(old.registry)

          const at = newList.findIndex(message => message.id === newMessage.id)
          if (at === -1) {
            newList.push(newMessage)
          } else {
            newList[at] = newMessage
          }
          newRegistry.set(newMessage.id, newMessage)

          return {
            list: newList,
            registry: newRegistry,
          }
        })
      )
      queryClient.setQueryData(
        ['messages', conversationId, 'latest-added'],
        () => {
          return newMessage
        }
      )
    }

    const removeMessage = async (deletedMessageRaw: MessageRaw) => {
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] })

      queryClient.setQueryData(
        ['messages', conversationId], 
        ((oldCache?: MessageCache) => {
          const old: MessageCache = oldCache || {
            list: [],
            registry: new Map(),
          }

          const newList = [...old.list]
          const newRegistry = new Map(old.registry)

          const at = newList.findIndex(message => message.id === deletedMessageRaw.id)
          if (at === -1) {
            newRegistry.delete(deletedMessageRaw.id)
          } else {
            newList.splice(at, 1)
            newRegistry.delete(deletedMessageRaw.id)
          }

          return {
            list: newList,
            registry: newRegistry,
          }
        })
      )
    }

    socket.on('receive-message-chunk', receiveMessageChunk)
    socket.on('receive-message', receiveMessage)
    socket.on('remove-message', removeMessage)
    return () => {
      socket.off('receive-message-chunk', receiveMessageChunk)
      socket.off('receive-message', receiveMessage)
      socket.off('remove-message', removeMessage)
    }
  }, [conversationId, queryClient, me, socket])
}

export const useLatestAddedMessage = (conversationId: string) => {
  const queryClient = useQueryClient()
  return queryClient.getQueryData<Message | undefined>(['messages', conversationId, 'latest-added']) ?? undefined
}