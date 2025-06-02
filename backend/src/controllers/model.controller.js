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
      const { visibility, name, llmModel, endpointUrl, apiKey } = request.body

      try {
        const data = await service.update(modelId, {
          visibility,
          name,
          llmModel,
          endpointUrl,
          apiKey,
        })
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },

    async create(request, reply) {
      const { name, llmModel, endpointUrl, apiKey } = request.body

      try {
        const data = await service.create({
          name,
          llmModel,
          endpointUrl,
          apiKey,
        })
        reply.code(201).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    }
  }
}
