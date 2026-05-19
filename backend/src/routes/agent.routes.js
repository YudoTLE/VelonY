export default async function agentRoutes(fastify) {
  const c = fastify.agentController
  const avatarBodyLimit = Number(process.env.AGENT_AVATAR_BODY_LIMIT_BYTES || 8 * 1024 * 1024)

  fastify.get('/',                             c.list)
  fastify.post('/',                            c.create)
  fastify.get('/:agentId',                     c.get)
  fastify.patch('/:agentId',                   c.update)
  fastify.put('/:agentId/avatar',              { bodyLimit: avatarBodyLimit }, c.updateAvatar)
  fastify.delete('/:agentId',                  c.delete)
  fastify.post('/:agentId/subscribers/self',   c.addSubscriptionSelf)
  fastify.delete('/:agentId/subscribers/self', c.removeSubscriptionSelf)
}
