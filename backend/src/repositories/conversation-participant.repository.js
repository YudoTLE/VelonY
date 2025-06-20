import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'
import { mapSupabaseError } from '../lib/error.js'

export default function ConversationParticipantRepository() {
  return {
    async select(filter = {}) {
      const { supabase } = getContext()

      let query = supabase
        .from('conversation_participants')
        .select()
      if (filter.userId != null) {
        query = query.eq('user_id', filter.userId)
      }
      if (filter.conversationId != null) {
        query = query.eq('conversation_id', filter.conversationId)
      }
      if (Array.isArray(filter.userIds)) {
        query = query.in('user_id', filter.userIds)
      }
      if (Array.isArray(filter.conversationIds)) {
        query = query.in('conversation_id', filter.conversationIds)
      }

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async delete(filter = {}) {
      const { supabase } = getContext()

      let query = supabase
        .from('conversation_participants')
        .delete()
      if (filter.userId != null) {
        query = query.eq('user_id', filter.userId)
      }
      if (filter.conversationId != null) {
        query = query.eq('conversation_id', filter.conversationId)
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
        .from('conversation_participants')
        .update(changeKeys.snakeCase(updates))
      if (filter.userId != null) {
        query = query.eq('user_id', filter.userId)
      }
      if (filter.conversationId != null) {
        query = query.eq('conversation_id', filter.conversationId)
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

      let query = supabase
        .from('conversation_participants')
        .insert(changeKeys.snakeCase(inserts, 2))
        .select()

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async upsert(payload = []) {
      const { supabase } = getContext()
    
      const upserts = payload.map(values => Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v !== undefined)
      ))
    
      let query = supabase
        .from('conversation_participants')
        .upsert(changeKeys.snakeCase(upserts, 2), { onConflict: 'user_id,conversation_id', ignoreDuplicates: true })
        .select()
    
      const { data, error } = await query
    
      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },
  }
}
