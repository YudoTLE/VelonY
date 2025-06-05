import OpenAI from 'openai'
import { getContext } from '../lib/async-local-storage.js'

export default function ConversationService({ repo, io }) {
  return {
    async delete(conversationId) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthorized' }
      return await repo.conversation.delete(conversationId)
    },

    async list() {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthorized' }
      return await repo.conversation.listForUser(user.sub)
    },

    async create({ title }) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthorized' }
      return await repo.conversation.createForUser(user.sub, {
        title
      })
    },

    async listMessages(conversationId) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthorized' }
      return await repo.message.listForConversation(conversationId, { maxToken: 100 })
    },

    async postMessage({
      conversationId,
      content,
      extra,
    }) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthorized' }
      
      const [message, participants] = await Promise.all([
        repo.message.createForUser(user.sub, {
          conversationId,
          type: 'user',
          content,
          extra,
        }),
        repo.user.listForConversation(conversationId),
      ])

      for (const participant of participants) {
        if (participant.id !== user.sub) {
          io.of('/users').to(participant.id).emit('receive-message', message)
        }
      }

      return message
    },

    async postMessageAI({
      conversationId,
      agentId,
      modelId,
    }) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthorized' }
      
      const [messages, agent, model, participants] = await Promise.all([
        repo.message.listForConversation(conversationId, { maxToken: 1000 }),
        repo.agent.get(agentId),
        repo.model.get(modelId),
        repo.user.listForConversation(conversationId)
      ])

      const openai = new OpenAI({
        baseURL: model.endpointUrl,
        apiKey: model.apiKey,
      })

      const systemPrompt = {
        role: 'system',
        content: [
          `# Identity`,
          `You are an AI agent ${agent.name} with agentId ${agent.id} using model ${model.name} with modelId with agentId ${model.id} in a private (or possibly group) conversation.`,
          `# Instruction`,
          `- Always use the metadata to understand who is speaking.`,
          `- Respond naturally as the agent, without repeating or referencing the metadata.`,
          `- Maintain consistency as ${agent.name}.`,
          `- DO NOT INCLUDE ANY METADATA IN YOUR RESPONSE UNDER ANY CIRCUMSTANCE.`,
          agent.systemPrompt,
        ].join('\n'),
      }
      const messageLogs = messages.map((message) => {
        switch (message.type) {
          case 'user':
            return {
              role: 'user',
              content: [
                `[sender: (${message.senderId}) ${message.senderName}]`,
                '',
                message.content,
              ].join('\n'),
            }
          case 'agent':
            return {
              role: message.agentId === agentId ? 'assistant' : 'user',
              content: message.agentId === agentId ? message.content : [
                `[agent: (${message.agentId}) ${message.agentName}]`,
                // `[model: (${message.modelId}) ${message.modelName}]`,
                '',
                message.content,
              ].join('\n'),
            }
          default:
            return null;
        }
      }).filter(Boolean)

      const payload = {
        model: model.llmModel,
        stream: true,
        temperature: agent.temperature,
        messages: [
          systemPrompt,
          ...messageLogs,
          systemPrompt,
        ],
      }

      const stream = await openai.chat.completions.create(payload)

      let streamedMessage
      try {
        streamedMessage = await repo.message.createForUser(user.sub, {
          conversationId,
          content: '',
          extra: '',
          type: 'agent',
          agentId,
          modelId,
        })

        for (const participant of participants) {
          io.of('/users').to(participant.id).emit('receive-message', streamedMessage)
        }

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta
          
          const deltaContent = delta.content || ''
          const deltaExtra = delta.reasoning_content || ''

          streamedMessage.content += deltaContent
          streamedMessage.extra += deltaExtra

          for (const participant of participants) {
            io.of('/users').to(participant.id).emit('receive-message-chunk', {
              messageId: streamedMessage.id,
              deltaContent,
              deltaExtra,
            })
          }
        }
      } catch(e) {
        throw e
      } finally {
        return await repo.message.update(streamedMessage.id, {
          content: streamedMessage.content,
          extra: streamedMessage.extra,
        })
      }
    },
  }
}