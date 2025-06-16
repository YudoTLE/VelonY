import { RealtimeInterface } from './realtime-interface.js'
import { Server } from 'socket.io'

export class SocketIOProvider extends RealtimeInterface {
  constructor(fastify, options = {}) {
    super()

    this.fastify = fastify
    this.io = new Server(fastify.server, options.socketio || {})    

    this.setupConnection()

    fastify.log.info('Using socket.io as realtime provider')
  }

  setupConnection() {
    this.io.of('/users').on('connection', socket => {
      try {
        const user = this.fastify.jwt.verify(socket.handshake.auth.token)

        socket.join(user.sub)

      } catch (err) {
        return socket.disconnect(true)
      }
    })
  }

  async emit(namespace, channel, event, data) {
    this.io.of(`/${namespace}`).to(channel).emit(event, data)
  }

  async cleanup() {
    this.io.close()
  }
}