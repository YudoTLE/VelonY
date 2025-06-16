import fp from 'fastify-plugin'
import { SocketIOProvider } from './socketio-provider.js'
import { PusherProvider } from './pusher-provider.js'

async function realtimePlugin(fastify, options) {
  let realtimeProvider
  switch (process.env.REALTIME_PROVIDER) {
    case 'SOCKETIO':
      realtimeProvider = new SocketIOProvider(fastify, options)
      break
    case 'PUSHER':
      realtimeProvider = new PusherProvider(fastify, options)
      break
    default:
      throw new Error(`Unknown realtime provider: ${provider}`)
  }
  
  fastify.decorate('realtime', realtimeProvider)
  
  fastify.addHook('onClose', async (instance, done) => {
    await realtimeProvider.cleanup()
    done()
  })
}

export default fp(realtimePlugin, {
  name: 'realtime',
  fastify: '5.x',
  dependencies: ['jwt']
})
