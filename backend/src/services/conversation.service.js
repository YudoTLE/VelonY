import OpenAI from 'openai'
import { getContext } from '../lib/async-local-storage.js'

export default function ConversationService({ repo, realtime }) {
  return {
    async list() {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }

      const participants = await repo.conversationParticipant.select({ userId: user.sub })
      const conversationIds = participants.map(cp => cp.conversationId)

      const [conversations, participantsCombined] = await Promise.all([
        repo.conversation.select({ conversationIds }),
        repo.conversationParticipant.select({ conversationIds }),
      ])

      const userIds = [...new Set(participantsCombined.map(p => p.userId))]
      const users = await repo.user.select({ userIds })

      const userMap = new Map(users.map(u => [u.id, u]))

      const participantsMap = new Map()
      for (const p of participantsCombined) {
        if (!participantsMap.has(p.conversationId)) {
          participantsMap.set(p.conversationId, [])
        }
        participantsMap.get(p.conversationId).push({
          role: p.role,
          user: userMap.get(p.userId)
        })
      }
    
      const enrichedConversations = conversations.map(c => ({
        ...c,
        participants: participantsMap.get(c.id) || [],
      }))
    
      return enrichedConversations
    },

    async delete(conversationId) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }

      const [conversation] = await repo.conversation.delete({ conversationId })
    
      const enrichedConversation = {
        ...conversation,
        participants: [],
      }

      return enrichedConversation
    },

    async get(conversationId) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }
    
      const [[conversation], participants] = await Promise.all([
        repo.conversation.select({ conversationId }),
        repo.conversationParticipant.select({ conversationId }),
      ])
    
      const userIds = [participants.map(p => p.userId)]
      const users = await repo.user.select({ userIds })
    
      const userMap = new Map(users.map(u => [u.id, u]))
    
      const enrichedConversation = {
        ...conversation,
        participants: participants.map(p => ({
          role: p.role,
          user: userMap.get(p.userId)
        })),
      }
    
      return enrichedConversation
    },

    async create(payload) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }

      const [[conversation], currentUser] = await Promise.all([
        repo.conversation.insert([
          { ...payload, creatorId: user.sub }
        ]),
        repo.user.select({ userId: user.sub }),
      ])
      const [participant] = await repo.conversationParticipant.insert(
        [{ userId: user.sub, conversationId: conversation.id, role: 'creator' }]
      )

      const enrichedConversation = {
        ...conversation,
        participants: [{
          role: participant.role,
          user: currentUser,
        }],
      }

      return enrichedConversation
    },

    async listMessages(conversationId) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }
    
      const messages = await repo.message.select({ conversationId })
    
      const uniq = (arr) => [...new Set(arr)]
      const userIds = uniq(messages.filter(m => !!m.senderId).map(m => m.senderId))
      const agentIds = uniq(messages.filter(m => !!m.agentId).map(m => m.agentId))
      const modelIds = uniq(messages.filter(m => !!m.modelId).map(m => m.modelId))
    
      const [users, agents, models] = await Promise.all([
        repo.user.select({ userIds }),
        repo.agent.select({ agentIds }),
        repo.model.select({ modelIds }),
      ])
    
      const userMap = new Map(users.map(u => [u.id, u]))
      const agentMap = new Map(agents.map(a => [a.id, a]))
      const modelMap = new Map(models.map(m => [m.id, m]))
    
      const enrichedMessages = messages.map(m => {
        const sender = userMap.get(m.senderId)
        const agent = agentMap.get(m.agentId)
        const model = modelMap.get(m.modelId)
      
        return {
          ...m,
          senderName: sender?.name,
          senderAvatar: sender?.avatar,
          agentName: agent?.name,
          agentUpdatedAt: agent?.updatedAt,
          modelName: model?.name,
          status: 'sent',
        }
      })
    
      return enrichedMessages
    },

    async postMessage({
      conversationId,
      content,
      extra,
    }) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }
    
      const [[message], participants, _] = await Promise.all([
        repo.message.insert([{
          senderId: user.sub,
          conversationId,
          type: 'user',
          content,
          extra,
        }]),
        repo.conversationParticipant.select({ conversationId }),
        repo.conversation.update({ conversationId }, { updatedAt: new Date() }),
      ])
    
      const userIds = participants.map(p => p.userId)
      const users = await repo.user.select({ userIds })
    
      const userMap = new Map(users.map(user => [user.id, user]))
    
      const enrichedMessage = {
        ...message,
        senderName: userMap.get(message.senderId)?.name ?? null,
        senderAvatar: userMap.get(message.senderId)?.avatar ?? null,
        status: 'sent',
      }
    
      for (const participant of participants) {
        if (participant.userId !== user.sub) {
          realtime.emit('users', participant.userId, 'receive-message', enrichedMessage)
        }
      }
    
      return enrichedMessage
    },

    async postMessageAI({
      conversationId,
      agentId,
      modelId,
      hint,
    }) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }
      
      const messages = await repo.message.select({ conversationId })

      const uniq = (arr) => [...new Set(arr)]
      const userIds = uniq([user.sub, ...messages.filter(m => !!m.senderId).map(message => message.senderId)])
      const agentIds = uniq([agentId, ...messages.filter(m => !!m.agentId).map(message => message.agentId)])

      const [users, agents, [model]] = await Promise.all([
        repo.user.select({ userIds }),
        repo.agent.select({ agentIds }),
        repo.model.select({ modelId }),
      ])
    
      const userMap = new Map(users.map(user => [user.id, user]))
      const agentMap = new Map(agents.map(agent => [agent.id, agent]))

      const sender = userMap.get(user.sub)
      const agent = agentMap.get(agentId)

      const [streamedMessage] = await repo.message.insert([{
        senderId: user.sub,
        conversationId,
        content: '',
        extra: '',
        type: 'agent',
        agentId,
        modelId,
      }])

      const streamMessage = async () => {
        try {

        const modelConfig = Object.fromEntries(
          model.config.map(({ name, value }) => [name, value])
        )

        const openai = new OpenAI({
          baseURL: model.endpoint,
          apiKey: model.apiKey,
        })

        const responseHint = typeof hint === 'string' ? hint.trim() : ''
        const messageLogsUnmerged = messages.map((message) => {
          const messageSender = userMap.get(message.senderId)
          const messageAgent = agentMap.get(message.agentId)

          switch (message.type) {
            case 'user':
              return {
                role: 'user',
                speakerHeader: `[speaker: (${messageSender?.id ?? 'unknown'}) ${messageSender?.name ?? 'Unknown'}]`,
                speakerKey: `speaker:${messageSender?.id ?? 'unknown'}`,
                content: message.content,
              }
            case 'agent':
              return {
                role: messageAgent?.id === agentId ? 'assistant' : 'user',
                speakerHeader: messageAgent?.id === agentId
                  ? null
                  : `[speaker: (${messageAgent?.id ?? 'unknown'}) ${messageAgent?.name ?? 'Unknown'}]`,
                speakerKey: messageAgent?.id === agentId
                  ? `self:${agentId}`
                  : `speaker:${messageAgent?.id ?? 'unknown'}`,
                content: message.content,
              }
            default:
              return null;
          }
        }).filter(Boolean)

        const messageLogs = messageLogsUnmerged.reduce((acc, message) => {
          const prev = acc[acc.length - 1]
          if (prev && prev.role === message.role && prev.speakerKey === message.speakerKey) {
            prev.content = [prev.content, message.content].join('\n\n')
            return acc
          }

          acc.push({ ...message })
          return acc
        }, []).map(({ speakerKey, speakerHeader, content, ...message }) => ({
          ...message,
          content: speakerHeader ? [speakerHeader, '', content].join('\n') : content,
        }))

        const hintMessage = responseHint
          ? {
              role: 'user',
              content: [
                `<response_hint scope="next_reply">`,
                responseHint,
                `</response_hint>`,
              ].join('\n'),
            }
          : null
        const shouldPadUserTurn = !hintMessage && messageLogs[messageLogs.length - 1]?.role === 'assistant'
        const systemPrompt = {
          role: 'system',
          content: [
            `# Identity`,
            `You are an AI agent ${agent.name} with agentId ${agent.id} in a private (or possibly group) conversation.`,
            `# Instruction`,
            `- Always use the metadata to understand who is speaking.`,
            ...(responseHint
              ? [`- A <response_hint> metadata block is included after the conversation history. Use it as next-reply guidance; it is not dialogue.`]
              : []),
            ...(shouldPadUserTurn
              ? [`- An application-inserted [Continue the conversation naturally] marker is included after the conversation history. Treat it as a request to write your next response, not as dialogue or a speaker message.`]
              : []),
            `- Respond naturally as the agent, without repeating or referencing the metadata.`,
            `- Maintain consistency as ${agent.name}.`,
            `- DO NOT INCLUDE ANY METADATA IN YOUR RESPONSE UNDER ANY CIRCUMSTANCE.`,
            agent.systemPrompt,
          ].join('\n'),
        }
        const payloadMessages = [
          systemPrompt,
          ...messageLogs,
          ...(shouldPadUserTurn ? [{ role: 'user', content: '[Continue the conversation naturally]' }] : []),
          ...(hintMessage ? [hintMessage] : []),
          systemPrompt,
        ]

        const payload = {
          model: model.llm,
          stream: true,
          ...modelConfig,
          messages: payloadMessages,
        }

        const stream = await openai.chat.completions.create(payload)

          let accDeltaContent = ''
          let accDeltaExtra = ''
          let chunkIndex = 0
          const flush = () => {
            if (!accDeltaContent && !accDeltaExtra) return

            streamedMessage.content += accDeltaContent
            streamedMessage.extra += accDeltaExtra
            chunkIndex += 1

            for (const participantId of userIds) {
              realtime.emit('users', participantId, 'receive-message-chunk', {
                messageId: streamedMessage.id,
                chunkIndex,
                deltaContent: accDeltaContent,
                deltaExtra: accDeltaExtra,
              })
            }

            accDeltaContent = ''
            accDeltaExtra = ''
          }

          const BUFFER_SIZE = parseInt(process.env.STREAM_BUFFER_SIZE) || 10
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta

            const deltaContent = delta.content || ''
            const deltaExtra = delta.reasoning_content || ''

            accDeltaContent += deltaContent
            accDeltaExtra += deltaExtra

            if (accDeltaContent.length + accDeltaExtra.length > BUFFER_SIZE) {
              flush()
            }
          }
          flush()
        } catch(e) {
          console.error('Streaming error:', e)
        } finally {
          const [updatedMessage] = await repo.message.update({ messageId: streamedMessage.id }, {
            content: streamedMessage.content,
            extra: streamedMessage.extra,
          })

          const enrichedUpdatedMessage = {
            ...updatedMessage,
            senderName: sender?.name,
            senderAvatar: sender?.avatar,
            agentName: agent?.name,
            agentUpdatedAt: agent?.updatedAt,
            modelName: model?.name,
            status: 'sent',
          }

          for (const participantId of userIds) {
            realtime.emit('users', participantId, 'receive-message', enrichedUpdatedMessage)
          }
        }
      }
      
      const enrichedStreamedMessage = {
        ...streamedMessage,
        senderName: sender?.name,
        senderAvatar: sender?.avatar,
        agentName: agent?.name,
        agentUpdatedAt: agent?.updatedAt,
        modelName: model?.name,
        status: 'sending',
      }

      for (const participantId of userIds) {
        realtime.emit('users', participantId, 'receive-message', enrichedStreamedMessage)
      }

      streamMessage()

      return enrichedStreamedMessage;
    },

    async addParticipant({ userId, conversationId }) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }

      await repo.conversationParticipant.upsert([{ userId, conversationId, role: 'member' }])
      const [participants, [conversation]] = await Promise.all([
        repo.conversationParticipant.select({ conversationId }),
        repo.conversation.select({ conversationId }),
      ])
    
      const userIds = [participants.map(p => p.userId)]
      const users = await repo.user.select({ userIds })
    
      const userMap = new Map(users.map(u => [u.id, u]))
    
      const enrichedConversation = {
        ...conversation,
        participants: participants.map(p => ({
          role: p.role,
          user: userMap.get(p.userId)
        })),
      }
    
      return enrichedConversation
    },

    async removeParticipant({ userId, conversationId }) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }
    
      const [conversation] = await repo.conversation.select({ conversationId })
      await repo.conversationParticipant.delete({ userId, conversationId })

      const enrichedConversation = {
        ...conversation,
        participants: [],
      }

      return enrichedConversation
    },

    async updateParticipant({ userId, conversationId }, { role }) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }
    
      await repo.conversationParticipant.update({ userId, conversationId }, { role })
      const [participants, [conversation]] = await Promise.all([
        repo.conversationParticipant.select({ conversationId }),
        repo.conversation.select({ conversationId }),
      ])
    
      const userIds = [participants.map(p => p.userId)]
      const users = await repo.user.select({ userIds })
    
      const userMap = new Map(users.map(u => [u.id, u]))

      const enrichedConversation = {
        ...conversation,
        participants: participants.map(p => ({
          role: p.role,
          user: userMap.get(p.userId)
        })),
      }
    
      return enrichedConversation
    },
  }
}
