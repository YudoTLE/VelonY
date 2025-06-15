import fp from 'fastify-plugin'
import fastifyRedis from '@fastify/redis'

async function redisPlugin(fastify, options) {
  fastify.register(fastifyRedis, {
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  })
}

export default fp(redisPlugin, {
  name: 'redis',
})

