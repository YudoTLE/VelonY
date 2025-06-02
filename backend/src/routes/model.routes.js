export default async function modelRoutes(fastify) {
  const c = fastify.modelController

  fastify.get('/',           c.list)
  fastify.get('/:modelId',   c.get)
  fastify.patch('/:modelId', c.update)
  fastify.post('/',          c.create)
}
