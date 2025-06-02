import fp from 'fastify-plugin'
import fastifyJWT from '@fastify/jwt'

export default fp(async function (fastify, opts) {
  fastify.register(fastifyJWT, {
    secret: process.env.JWT_SECRET,
    sign: { algorithm: 'HS256' }
  })

  // attach user object if Bearer token present
  fastify.addHook('onRequest', async (request, reply) => {
    const auth = request.headers.authorization
    if (auth?.startsWith('Bearer ')) {
      try {
        request.user = fastify.jwt.verify(auth.slice(7))
      } catch {
        request.user = null
      }
    }
  })
}, {
  name: 'jwt'
})
