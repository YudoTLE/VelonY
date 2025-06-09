export default function ModelController({ service, log }) {
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
      const { modelId } = request.params

      try {
        const data = await service.get(modelId)
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async update(request, reply) {
      const { modelId } = request.params
      const { visibility, name, description, llmModel, endpointUrl, apiKey, preset, config } = request.body

      try {
        const data = await service.update(modelId, {
          visibility,
          name,
          description,
          llmModel,
          endpointUrl,
          apiKey,
          preset,
          config,
        })
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async create(request, reply) {
      const { name, description, llmModel, endpointUrl, apiKey, preset, config } = request.body

      try {
        const data = await service.create({
          name,
          description,
          llmModel,
          endpointUrl,
          apiKey,
          preset,
          config,
        })
        reply.code(201).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async addSubscriptionSelf(request, reply) {
      const { user } = request
      const { modelId } = request.params

      try {
        const data = await service.addSubscription({ userId: user.sub, modelId })
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async removeSubscriptionSelf(request, reply) {
      const { user } = request
      const { modelId } = request.params
      
      try {
        const data = await service.removeSubscription({ userId: user.sub, modelId })
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },
  }
}
