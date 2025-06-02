export default async function authRoutes(fastify) {
  const c = fastify.authController

  fastify.get('/google/callback', c.handleGoogleCallback)
}