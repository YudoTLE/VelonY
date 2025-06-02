export default async function conversationsRoutes(fastify) {
  const c = fastify.conversationController

  fastify.get('/',                          c.list)
  fastify.post('/',                         c.create)
  fastify.delete('/:conversationId',        c.delete)
  fastify.get('/:conversationId/messages',  c.listMessages)
  fastify.post('/:conversationId/messages', c.postMessage)
}