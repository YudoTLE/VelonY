import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'
import { mapSupabaseError } from '../lib/error.js'

export default function AgentRepository() {
  return {
    async select(query) {
      const { supabase } = getContext()

      let dbQuery = supabase
        .from('enriched_agents')
        .select()
      if (query.agent_id != null) {
        dbQuery = dbQuery.eq('id', query.agent_id)
      }
      if (query.creator_id != null) {
        dbQuery = dbQuery.eq('creator_id', query.creator_id)
      }
      if (query.user_id != null) {
        dbQuery = dbQuery.eq('user_id', query.user_id)
      }
      if (query.visibility != null) {
        dbQuery = dbQuery.eq('visibility', query.visibility)
      }

      const { data, error } = await dbQuery

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async update({ agentId, creatorId, userId, visibility }, payload = {}) {
      const { supabase } = getContext()

      const updates = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      )

      let query = supabase
        .from('agents')
        .update(changeKeys.snakeCase(updates))
      if (agentId != null) {
        query = query.eq('id', agentId)
      }
      if (creatorId != null) {
        query = query.eq('creator_id', creatorId)
      }
      if (userId != null) {
        query = query.eq('user_id', userId)
      }
      if (visibility != null) {
        query = query.eq('visibility', visibility)
      }
      query = query.select()

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async delete({ agentId, creatorId, userId, visibility }) {
      const { supabase } = getContext()

      let query = supabase
        .from('agents')
        .delete()
      if (agentId != null) {
        query = query.eq('id', agentId)
      }
      if (creatorId != null) {
        query = query.eq('creator_id', creatorId)
      }
      if (userId != null) {
        query = query.eq('user_id', userId)
      }
      if (visibility != null) {
        query = query.eq('visibility', visibility)
      }
      query = query.select()

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async insert(payload = {}) {
      const { supabase } = getContext()

      const fields = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      )

      const { data, error } = await supabase
        .from('agents')
        .insert({
          ...changeKeys.snakeCase(fields),
        })
        .select()
        .single()

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data)
    },
  }
}