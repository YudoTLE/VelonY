export default async function modelRoutes(fastify) {
  const c = fastify.modelController

  fastify.get('/',                             c.list)
  fastify.post('/',                            c.create)
  fastify.get('/:modelId',                     c.get)
  fastify.patch('/:modelId',                   c.update)
  fastify.delete('/:modelId',                  c.delete)
  fastify.post('/:modelId/subscribers/self',   c.addSubscriptionSelf)
  fastify.delete('/:modelId/subscribers/self', c.removeSubscriptionSelf)
}
