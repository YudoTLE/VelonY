export default function AuthService({ googleOAuth2, repo, fetch }) {
  return {
    async processGoogleOAuth(request) {
      const { token } = await googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
      const { user } = await repo.db.authenticate('google', token.id_token)
      const [enrichedUser] = await repo.user.upsert({ id: user.id })

      return enrichedUser
    }
  }
}