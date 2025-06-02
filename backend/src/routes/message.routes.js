export default async function messageRoutes(fastify) {
  const c = fastify.messageController

  fastify.delete('/:messageId', c.delete)
}