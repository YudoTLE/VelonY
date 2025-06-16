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
          senderAvatar: sender?.avatarUrl,
          agentName: agent?.name,
          modelName: model?.name,
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
        senderAvatar: userMap.get(message.senderId)?.avatarUrl ?? null,
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

      const modelConfig = Object.fromEntries(
        model.config.map(({ name, value }) => [name, value])
      )
      
      const openai = new OpenAI({
        baseURL: model.endpoint,
        apiKey: model.apiKey,
      })

      const systemPrompt = {
        role: 'system',
        content: [
          `# Identity`,
          `You are an AI agent ${agent.name} with agentId ${agent.id} in a private (or possibly group) conversation.`,
          `# Instruction`,
          `- Always use the metadata to understand who is speaking.`,
          `- Respond naturally as the agent, without repeating or referencing the metadata.`,
          `- Maintain consistency as ${agent.name}.`,
          `- DO NOT INCLUDE ANY METADATA IN YOUR RESPONSE UNDER ANY CIRCUMSTANCE.`,
          agent.systemPrompt,
        ].join('\n'),
      }
      const messageLogs = messages.map((message) => {
        const messageSender = userMap.get(message.senderId)
        const messageAgent = agentMap.get(message.agentId)

        switch (message.type) {
          case 'user':
            return {
              role: 'user',
              content: [
                `[sender: (${messageSender?.id}) ${messageSender?.name}]`,
                '',
                message.content,
              ].join('\n'),
            }
          case 'agent':
            return {
              role: messageAgent?.id === agentId ? 'assistant' : 'user',
              content: messageAgent?.id === agentId ? message.content : [
                `[agent: (${messageAgent?.id}) ${messageAgent?.name}]`,
                '',
                message.content,
              ].join('\n'),
            }
          default:
            return null;
        }
      }).filter(Boolean)

      const payload = {
        model: model.llm,
        stream: true,
        ...modelConfig,
        messages: [
          systemPrompt,
          ...messageLogs,
          systemPrompt,
        ],
      }

      const stream = await openai.chat.completions.create(payload)

      let streamedMessage
      try {
        [streamedMessage] = await repo.message.insert([{
          senderId: user.sub,
          conversationId,
          content: '',
          extra: '',
          type: 'agent',
          agentId,
          modelId,
        }])
        console.log('MSG TEMP', streamedMessage)

        const enrichedStreamedMessage = {
          ...streamedMessage,
          senderName: sender?.name,
          senderAvatar: sender?.avatar,
          agentName: agent?.name,
          modelName: model?.name,
        }

        for (const participantId of userIds) {
          realtime.emit('users', participantId, 'receive-message', enrichedStreamedMessage)
        }

        let accDeltaContent = ''
        let accDeltaExtra = ''
        const flush = () => {
          streamedMessage.content += accDeltaContent
          streamedMessage.extra += accDeltaExtra
          
          for (const participantId of userIds) {
            realtime.emit('users', participantId, 'receive-message-chunk', {
              messageId: streamedMessage.id,
              deltaContent: accDeltaContent,
              deltaExtra: accDeltaExtra,
            })
          }

          accDeltaContent = ''
          accDeltaExtra = ''
        }

        const ACC_CAPACITY = 100
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta
          
          const deltaContent = delta.content || ''
          const deltaExtra = delta.reasoning_content || ''

          accDeltaContent += deltaContent
          accDeltaExtra += deltaExtra

          if (accDeltaContent.length + accDeltaExtra.length > ACC_CAPACITY) {
            flush()
          }
        }
        flush()
      } catch(e) {
        throw e
      } finally {
        const [[finalMessage], _] = await Promise.all([
          repo.message.update({ messageId: streamedMessage.id }, {
            content: streamedMessage.content,
            extra: streamedMessage.extra,
          }),
          repo.conversation.update({ conversationId }, { updatedAt: new Date() })
        ])

        const finalEnrichedMessage = {
          ...finalMessage,
          senderName: sender?.name,
          senderAvatar: sender?.avatar,
          agentName: agent?.name,
          modelName: model?.name,
        }

        return finalEnrichedMessage
      }
    },

    async addParticipant({ userId, conversationId }) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }

      await repo.conversationParticipant.insert([{ userId, conversationId, role: 'member' }])
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