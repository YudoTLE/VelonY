export default function ConversationController({ service, log }) {
  return {
    async list(request, reply) {
      try {
        const data = await service.list()
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async create(request, reply) {
      const { title, type } = request.body

      try {
        const data = await service.create({
          title,
          type,
        })
        reply.code(201).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async delete(request, reply) {
      const { conversationId } = request.params

      try {
        const data = await service.delete(conversationId)
        reply.code(201).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async postMessage(request, reply) {
      const { conversationId } = request.params
      const { type, content, extra, agentId, modelId, tempId } = request.body

      try {
        if (type === 'user') {
          const data = await service.postMessage({
            conversationId,
            content,
            extra,
          })
          reply.code(201).send({ ...data, tempId })
        }
        
        if (type === 'agent') {
          if (!agentId || !modelId) {
            throw new Error('Missing reference')
          }

          const data = await service.postMessageAI({
            conversationId,
            agentId,
            modelId,
          })
          reply.code(201).send(data)
        } 
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async listMessages(request, reply) {
      const { conversationId } = request.params
      
      try {
        const data = await service.listMessages(conversationId)
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async addParticipantSelf(request, reply) {
      const { user } = request
      const { conversationId } = request.params
      
      try {
        const data = await service.addParticipant({ userId: user.sub, conversationId })
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async removeParticipantSelf(request, reply) {
      const { conversationId, userId } = request.params
      
      try {
        const data = await service.removeParticipant({ userId, conversationId })
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async updateParticipant(request, reply) {
      const { conversationId, userId } = request.params
      const { role } = request.body
      
      try {
        const data = await service.updateParticipant({ userId, conversationId }, { role })
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },
  }
}