export default async function userRoutes(fastify) {
  const c = fastify.userController

  fastify.get('/me', c.getMe)
}