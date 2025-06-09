import Fastify from 'fastify'
import pluginList from './plugins/index.js'
import routes from './routes/index.js'

import * as Controllers from './controllers/index.js'
import * as Services from './services/index.js'
import * as Repositories from './repositories/index.js'

const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,       // color output
        translateTime: 'SYS', // readable time format
        ignore: 'pid,hostname' // remove clutter
      }
    }
  }
})

for (const plugin of pluginList) {
  app.register(plugin)
}

app.register(async fastify => {
  const repositories = {
    db: Repositories.DBRepository(),
    user: Repositories.UserRepository(),
    message: Repositories.MessageRepository(),
    conversation: Repositories.ConversationRepository(),
    model: Repositories.ModelRepository(),
    agent: Repositories.AgentRepository(),
    conversationParticipant: Repositories.ConversationParticipantsRepository(),
    agentSubscription: Repositories.AgentSubscriptionRepository(),
    modelSubscription: Repositories.ModelSubscriptionRepository(),
  }

  const authService = Services.AuthService({ googleOAuth2: fastify.googleOAuth2, repo: repositories, fetch: global.fetch })
  const userService = Services.UserService({ repo: repositories })
  const messageService = Services.MessageService({ repo: repositories, io: fastify.io })
  const conversationService = Services.ConversationService({ repo: repositories, io: fastify.io })
  const modelService = Services.ModelService({ repo: repositories })
  const agentService = Services.AgentService({ repo: repositories })

  fastify.decorate('authController', Controllers.AuthController({
    service: authService, jwt: fastify.jwt, log: fastify.log
  }))
  fastify.decorate('userController', Controllers.UserController({
    service: userService, log: fastify.log
  }))
  fastify.decorate('messageController', Controllers.MessageController({
    service: messageService, log: fastify.log
  }))
  fastify.decorate('conversationController', Controllers.ConversationController({
    service: conversationService, log: fastify.log
  }))
  fastify.decorate('modelController', Controllers.ModelController({
    service: modelService, log: fastify.log
  }))
  fastify.decorate('agentController', Controllers.AgentController({
    service: agentService, log: fastify.log
  }))

  fastify.register(routes)
})

export default app