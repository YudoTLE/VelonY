import { RealtimeInterface } from './realtime-interface.js'
import Pusher from 'pusher'
export class PusherProvider extends RealtimeInterface {
  constructor(fastify, options = {}) {
    super()

    this.fastify = fastify
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID || options.appId,
      key: process.env.PUSHER_KEY || options.key,
      secret: process.env.PUSHER_SECRET || options.secret,
      cluster: process.env.PUSHER_CLUSTER || options.cluster,
      useTLS: true,
      ...options.pusher
    })
    this.setupConnection()

    fastify.log.info('Using pusher as realtime provider')
  }

  setupConnection() {
    this.fastify.post('/pusher/auth', async (request, reply) => {
      try {
        const token = request.body.auth || request.headers.authorization?.replace('Bearer ', '')

        const user = this.fastify.jwt.verify(token)
        const socketId = request.body.socket_id
        const channel = request.body.channel_name

        if (!user) {
          return reply.code(403).send({ error: 'Unauthorized' })
        }

        const auth = this.pusher.authorizeChannel(socketId, channel)
        return reply.send(auth)
      } catch (err) {
        return reply.code(401).send({ error: 'Invalid token' })
      }
    })
  }

  async emit(namespace, channel, event, data) {
    return this.pusher.trigger(`private-${namespace}-${channel}`, event, data)
  }
}