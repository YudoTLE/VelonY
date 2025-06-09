import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'
import { mapSupabaseError } from '../lib/error.js'

export default function AgentSubscriptionRepository() {
  return {
    async select({ userId, agentId }) {
      const { supabase } = getContext()

      let query = supabase
        .from('agent_subscriptions')
        .select()
      if (userId != null) {
        query = query.eq('user_id', userId)
      }
      if (agentId != null) {
        query = query.eq('agent_id', agentId)
      }

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async delete({ userId, agentId }) {
      const { supabase } = getContext()

      let query = supabase
        .from('agent_subscriptions')
        .delete()
      if (userId != null) {
        query = query.eq('user_id', userId)
      }
      if (agentId != null) {
        query = query.eq('agent_id', agentId)
      }
      query = query.select()

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async update({ userId, agentId }, payload) {
      const { supabase } = getContext()

      const updates = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      )

      let query = supabase
        .from('agent_subscriptions')
        .update(changeKeys.snakeCase(updates))
      if (userId != null) {
        query = query.eq('user_id', userId)
      }
      if (agentId != null) {
        query = query.eq('agent_id', agentId)
      }
      query = query.select()

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async insert({ userId, agentId }, payload = {}) {
      const { supabase } = getContext()

      const updates = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      )

      let query = supabase
        .from('agent_subscriptions')
        .insert({
          ...changeKeys.snakeCase(updates),
          user_id: userId,
          agent_id: agentId,
        })
        .select()
        .single()

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data)
    },
  }
}
