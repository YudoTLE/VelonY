import fp from 'fastify-plugin'
import fastifyFormbody from '@fastify/formbody'

export default fp(async function (fastify, options) {
  fastify.register(fastifyFormbody)
})