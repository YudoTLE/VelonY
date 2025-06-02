export default function AgentController({ service, log }) {
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
      const { visibility, name, systemPrompt, temperature } = request.body

      try {
        const data = await service.update(agentId, {
          visibility,
          name,
          systemPrompt,
          temperature,
        })
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async create(request, reply) {
      const { name, systemPrompt, temperature } = request.body

      try {
        const data = await service.create({
          name,
          systemPrompt,
          temperature,
        })
        reply.code(201).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    }
  }
}
