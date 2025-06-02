export default async function agentRoutes(fastify) {
  const c = fastify.agentController

  fastify.get('/',           c.list)
  fastify.get('/:agentId',   c.get)
  fastify.patch('/:agentId', c.update)
  fastify.post('/',          c.create)
}