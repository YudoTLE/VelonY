import fp from 'fastify-plugin'
import fastifyOAuth2 from '@fastify/oauth2'

export default fp(async function (fastify, options) {
  fastify.register(fastifyOAuth2, {
    name: 'googleOAuth2',
    scope: ['profile','email'],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID,
        secret: process.env.GOOGLE_CLIENT_SECRET,
      },
      auth: fastifyOAuth2.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: '/auth/google',
    callbackUri: process.env.NODE_ENV === 'development'
      ? `${process.env.BASE_URL}:${process.env.PORT}/auth/google/callback`
      : `${process.env.BASE_URL}/auth/google/callback`,
  })
})
