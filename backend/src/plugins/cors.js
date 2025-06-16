import fp from 'fastify-plugin'
import fastifyCors from '@fastify/cors'

export default fp(async function (fastify, opts) {
  fastify.register(fastifyCors, {
    origin: process.env.FRONTEND_URL,
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })
})