export default async function agentRoutes(fastify) {
  const c = fastify.agentController

  fastify.get('/',                             c.list)
  fastify.post('/',                            c.create)
  fastify.get('/:agentId',                     c.get)
  fastify.patch('/:agentId',                   c.update)
  fastify.post('/:agentId/subscribers/self',   c.addSubscriptionSelf)
  fastify.delete('/:agentId/subscribers/self', c.removeSubscriptionSelf)
}