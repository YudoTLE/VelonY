import fp from 'fastify-plugin'
import { createClient } from '@supabase/supabase-js'
import asyncLocalStorage from '../lib/async-local-storage.js'
import { getToken, updateAccessToken } from '../lib/token-store.js'

const getSupabaseClient = async (userId, fastify) => {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

  const token = getToken(userId)
  if (!token) return supabase

  let { accessToken, refreshToken, expiresAt } = token

  if (Date.now() > expiresAt - 60 * 1000) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (error) throw new Error('Failed to refresh token')

    accessToken = data.session?.access_token
    updateAccessToken(userId, accessToken, data.session?.expires_in)
  }
 
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  )
}

export default fp(async function (fastify, options) {
  fastify.addHook('onRequest', (request, reply, done) => {
    const store = {
      user: request.user,
      supabase: null,
    }

    asyncLocalStorage.run(store, async () => {
      store.supabase = await getSupabaseClient(request.user?.sub, fastify)
      done()
    })
  })
}, {
    dependencies: ['jwt']
})