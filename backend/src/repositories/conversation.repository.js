import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'
import { mapSupabaseError } from '../lib/error.js'

export default function ConversationRepository() {
  return {
    async select(filter = {}) {
      const { supabase } = getContext()

      let query = supabase
        .from('conversations')
        .select()
      if (filter.conversationId != null) {
        query = query.eq('id', filter.conversationId)
      }
      if (filter.creatorId != null) {
        query = query.eq('creator_id', filter.creatorId)
      }
      if (Array.isArray(filter.conversationIds)) {
        query = query.in('id', filter.conversationIds)
      }

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async delete(filter = {}) {
      const { supabase } = getContext()

      let query = supabase
        .from('conversations')
        .delete()
      if (filter.conversationId != null) {
        query = query.eq('id', filter.conversationId)
      }
      if (filter.creatorId != null) {
        query = query.eq('creator_id', filter.creatorId)
      }
      query = query.select()

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
        .from('conversations')
        .update(changeKeys.snakeCase(updates))
      if (filter.conversationId != null) {
        query = query.eq('id', filter.conversationId)
      }
      if (filter.creatorId != null) {
        query = query.eq('creator_id', filter.creatorId)
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
        .from('conversations')
        .insert(changeKeys.snakeCase(inserts, 2))
        .select()

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },
  }
}
