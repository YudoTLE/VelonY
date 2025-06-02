import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'
import { saveToken } from '../lib/token-store.js'

export default function DBRepository() {
  return {
    async authenticate(provider, token) {
      const { supabase } = await getContext()

      const { data, error } = await supabase.auth.signInWithIdToken({ 
        provider,
        token,
      })
      if (error) throw new Error(error.message)

      const userId = data.user.id
      const accessToken = data.session.access_token
      const refreshToken = data.session.refresh_token
      const expiresIn = data.session.expiresIn

      await saveToken(userId, {
        accessToken,
        refreshToken,
        expiresAt: Date.now() + expiresIn * 1000
      })

      return changeKeys.camelCase(data)
    },
  }
}