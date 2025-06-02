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
      const { title } = request.body

      try {
        const data = await service.create({
          title,
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
      const { content, type, agentId, modelId } = request.body

      try {
        if (type === 'user') {
          const data = await service.postMessage({
            conversationId,
            content,
          })
          reply.code(201).send(data)
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
    }
  }
}