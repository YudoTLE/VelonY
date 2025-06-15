import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'
import { mapSupabaseError } from '../lib/error.js'

export default function DBRepository() {
  return {
    async authenticate(provider, token) {
      const { supabase, redis } = await getContext()

      const { data, error } = await supabase.auth.signInWithIdToken({ 
        provider,
        token,
      })
      if (error) throw mapSupabaseError(error)

      const userId = data.user.id
      const accessToken = data.session.access_token
      const refreshToken = data.session.refresh_token
      const expiresIn = data.session.expires_in

      await redis.set(
        `supabase:token:${userId}`, 
        JSON.stringify({
          accessToken,
          refreshToken,
          expiresAt: Date.now() + expiresIn * 1000
        }),
        'EX',
        expiresIn - 60,
      )

      return changeKeys.camelCase(data)
    },
  }
}