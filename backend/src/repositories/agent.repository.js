import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'
import { mapSupabaseError } from '../lib/error.js'

export default function AgentRepository() {
  return {
    async listForAll() {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .from('enriched_agents')
        .select()
      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async listForUser(userId) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .from('enriched_agents')
        .select()
        .eq('creator_id', userId)
      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async get(agentId) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .from('enriched_agents')
        .select()
        .eq('id', agentId)
        .single()
      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data)
    },

    async update(agentId, payload) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .rpc('update_agent', {
          ...changeKeys.snakeCase(payload),
          agent_id: agentId,
        })
        .single()
      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data)
    },

    async createForUser(userId, payload) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .rpc('create_agent', {
          ...changeKeys.snakeCase(payload),
          creator_id: userId,
        })
        .single()
      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data)
    }
  }
}