export default async function messageRoutes(fastify) {
  const c = fastify.messageController

  fastify.patch('/:messageId', c.update)
  fastify.delete('/:messageId', c.delete)
}
