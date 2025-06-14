export default function AgentController({ service, log }) {
  return {
    async list(request, reply) {
      const { query } = request

      try {
        const data = await service.list(query)
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async get(request, reply) {
      const { agentId } = request.params

      try {
        const data = await service.get(agentId)
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async update(request, reply) {
      const { agentId } = request.params
      const { visibility, name, description, showDetails, systemPrompt } = request.body

      try {
        const data = await service.update(agentId, {
          visibility,
          name,
          description,
          showDetails,
          systemPrompt,
        })
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async create(request, reply) {
      const { name, description, showDetails, systemPrompt } = request.body

      try {
        const data = await service.create({
          name,
          description,
          showDetails,
          systemPrompt,
        })
        reply.code(201).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async addSubscriptionSelf(request, reply) {
      const { user } = request
      const { agentId } = request.params

      try {
        const data = await service.addSubscription({ userId: user.sub, agentId })
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async removeSubscriptionSelf(request, reply) {
      const { user } = request
      const { agentId } = request.params
      
      try {
        const data = await service.removeSubscription({ userId: user.sub, agentId })
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },
  }
}
