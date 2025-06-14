import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'
import { mapSupabaseError } from '../lib/error.js'

export default function MessageRepository() {
  return {
    async select(filter = {}) {
      const { supabase } = getContext()

      let query = supabase
        .from('messages')
        .select()
      if (filter.messageId != null) {
        query = query.eq('id', filter.messageId)
      }
      if (filter.conversationId != null) {
        query = query.eq('conversation_id', filter.conversationId)
      }

      const { data, error } = await query
      
      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async delete(filter = {}) {
      const { supabase } = getContext()

      let query = supabase
        .from('messages')
        .delete()
      if (filter.messageId != null) {
        query = query.eq('id', filter.messageId)
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
        .from('messages')
        .update(changeKeys.snakeCase(updates))
      if (filter.messageId != null) {
        query = query.eq('id', filter.messageId)
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
        .from('messages')
        .insert(changeKeys.snakeCase(inserts, 2))
        .select()

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },
  }
}