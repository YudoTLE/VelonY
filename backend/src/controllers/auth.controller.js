export default function AuthController({ service, jwt, log }) {
  return {
    async handleGoogleCallback(request, reply) {
      try {
        const { id: userId } = await service.processGoogleOAuth(request)
        const appToken = jwt.sign({ sub: userId }, { expiresIn: '1d' })
        return reply.redirect(`${process.env.FRONTEND_URL}/loggedin?token=${appToken}`)
      } catch (err) {
        log.error(err)
        return reply.code(err.status || 500).send({ error: err.message || 'Internal Server Error' })
      }
    }
  }
}
