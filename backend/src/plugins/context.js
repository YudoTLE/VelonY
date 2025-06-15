import fp from 'fastify-plugin'
import { createClient } from '@supabase/supabase-js'
import asyncLocalStorage from '../lib/async-local-storage.js'

const getSupabaseClient = async (userId, redis) => {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

  const tokenStr = await redis.get(`supabase:token:${userId}`)
  if (!tokenStr) return supabase

  let token = JSON.parse(tokenStr)

  let { accessToken, refreshToken, expiresAt } = token

  if (Date.now() > expiresAt - 60 * 1000) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (error) throw new Error('Failed to refresh token')

    accessToken = data.session?.access_token
    
    token.accessToken = accessToken
    token.expiresAt = Date.now() + data.session?.expires_in * 1000
    
    const ttl = Math.floor((token.expiresAt - Date.now()) / 1000) - 60
    await redis.set(
      `supabase:token:${userId}`,
      JSON.stringify(token),
      'EX',
      Math.max(ttl, 60)
    )
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
      redis: fastify.redis,
      supabase: null,
    }

    asyncLocalStorage.run(store, async () => {
      store.supabase = await getSupabaseClient(request.user?.sub, fastify.redis)
      done()
    })
  })
}, {
    dependencies: ['jwt', 'redis']
})