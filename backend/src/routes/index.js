import authRoutes         from './auth.routes.js'
import userRoutes         from './user.routes.js'
import conversationRoutes from './conversation.routes.js'
import messageRoutes      from './message.routes.js'
import modelRoutes        from './model.routes.js'
import agentRoutes        from './agent.routes.js'

export default async function routes(fastify, options) {
  fastify.register(authRoutes,         { prefix: '/auth' })
  fastify.register(userRoutes,         { prefix: '/users' })
  fastify.register(conversationRoutes, { prefix: '/conversations' })
  fastify.register(messageRoutes,      { prefix: '/messages' })
  fastify.register(modelRoutes,        { prefix: '/models' })
  fastify.register(agentRoutes,        { prefix: '/agents' })
}