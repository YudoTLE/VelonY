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
    }) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthorized' }
      
      const message = await repo.message.createForUser(user.sub, {
        conversationId,
        content,
        type: 'user',
      })
      
      const participants = await repo.user.listForConversation(conversationId)
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
      
      const messages = await repo.message.listForConversation(conversationId, { maxToken: 1000 })
      const agent = await repo.agent.get(agentId)
      const model = await repo.model.get(modelId)

      const openai = new OpenAI({
        baseURL: model.endpointUrl,
        apiKey: model.apiKey,
      })

      const payload = {
        model: model.llmModel,
        temperature: agent.temperature,
        messages: [
          {
            role: 'system',
            content: [
              `# Identity`,
              `You are an AI agent ${agent.name} with agentId ${agent.id} using model ${model.name} with modelId with agentId ${model.id} in a private (or possibly group) conversation.`,
              `# Instruction`,
              `- Always use the metadata to understand who is speaking.`,
              `- Respond naturally as the agent, without repeating or referencing the metadata.`,
              `- Maintain consistency with your agent_name (from the metadata).`,
              `- Do not include any metadata in your response.`,
              agent.systemPrompt,
            ].join('\n'),
          },
          ...messages.map((message) => {
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
          }).filter(Boolean),
        ],
      }
      const response = await openai.chat.completions.create(payload)

      const message = await repo.message.createForUser(user.sub, {
        conversationId,
        content: response.choices[0].message.content,
        type: 'agent',
        agentId,
        modelId,
      })

      const participants = await repo.user.listForConversation(conversationId)
      for (const participant of participants) {
        io.of('/users').to(participant.id).emit('receive-message', message)
      }

      return message
    },
  }
}