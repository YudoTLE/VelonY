import fp from 'fastify-plugin'
import { Server } from 'socket.io'

async function socketIOPlugin(fastify, options) {
  const io = new Server(fastify.server, options.io || {})
  fastify.decorate('realtime', io)

  fastify.addHook('onClose', (instance, done) => {
    io.close()
    done()
  })

  io.of('/users').on('connection', socket => {
    try {
      const user = fastify.jwt.verify(socket.handshake.auth.token)
      
      socket.join(user.sub)
    } catch (err) {
      return socket.disconnect(true)
    }
  })
}

export default fp(socketIOPlugin, {
  name: 'socketio',
  fastify: '5.x',
  dependencies: ['jwt']
})