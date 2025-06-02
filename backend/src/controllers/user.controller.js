export default function UserController({ service, log }) {
  return {
    async getMe(request, reply) {
      try {
        const data = await service.getMe()
        reply.code(200).send(data)
      } catch (err) {
        log.error(err)
        reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    },
  }
}