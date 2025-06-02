export default function MessageController({ service, log }) {
  return {
    async delete(request, reply) {
      try {
        const { messageId } = request.params
        const data = await service.delete(messageId)
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    }
  }
}