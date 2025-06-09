export default async function conversationsRoutes(fastify) {
  const c = fastify.conversationController

  fastify.get('/',                                       c.list)
  fastify.post('/',                                      c.create)
  fastify.delete('/:conversationId',                     c.delete)
  fastify.get('/:conversationId/messages',               c.listMessages)
  fastify.post('/:conversationId/messages',              c.postMessage)
  fastify.post('/:conversationId/participants/self',     c.addParticipantSelf)
  fastify.delete('/:conversationId/participants/self',   c.removeParticipantSelf)
  fastify.patch('/:conversationId/participants/:userId', c.updateParticipant)
}