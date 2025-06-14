import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'
import { mapSupabaseError } from '../lib/error.js'

export default function AgentRepository() {
  return {
    async select(filter = {}) {
      const { supabase } = getContext()

      let query = supabase
        .from('agents')
        .select()
      if (filter.agentId != null) {
        query = query.eq('id', filter.agentId)
      }
      if (filter.creatorId != null) {
        query = query.eq('creator_id', filter.creatorId)
      }
      if (filter.visibility != null) {
        query = query.eq('visibility', filter.visibility)
      }
      if (Array.isArray(filter.agentIds)) {
        query = query.in('id', filter.agentIds)
      }

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async update(filter = {}, payload = {}) {
      const { supabase } = getContext()

      const updates = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      )

      let query = supabase
        .from('agents')
        .update(changeKeys.snakeCase(updates))
      if (filter.agentId != null) {
        query = query.eq('id', filter.agentId)
      }
      if (filter.creatorId != null) {
        query = query.eq('creator_id', filter.creatorId)
      }
      if (filter.visibility != null) {
        query = query.eq('visibility', filter.visibility)
      }
      query = query.select()

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async delete(filter = {}) {
      const { supabase } = getContext()

      let query = supabase
        .from('agents')
        .delete()
      if (filter.agentId != null) {
        query = query.eq('id', filter.agentId)
      }
      if (filter.creatorId != null) {
        query = query.eq('creator_id', filter.creatorId)
      }
      if (filter.visibility != null) {
        query = query.eq('visibility', filter.visibility)
      }
      query = query.select()

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async insert(payload = []) {
      const { supabase } = getContext()

      const inserts = payload.map(values => Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v !== undefined)
      ))

      const { data, error } = await supabase
        .from('agents')
        .insert(changeKeys.snakeCase(inserts, 2))
        .select()

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },
  }
}