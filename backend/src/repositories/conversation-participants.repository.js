import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'
import { mapSupabaseError } from '../lib/error.js'

export default function ConversationParticipantsRepository() {
  return {
    async select({ userId, conversationId }) {
      const { supabase } = getContext()

      let query = supabase
        .from('conversation_participants')
        .select()
      if (userId != null) {
        query = query.eq('user_id', userId)
      }
      if (conversationId != null) {
        query = query.eq('conversation_id', conversationId)
      }

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async delete({ userId, conversationId }) {
      const { supabase } = getContext()

      let query = supabase
        .from('conversation_participants')
        .delete()
      if (userId != null) {
        query = query.eq('user_id', userId)
      }
      if (conversationId != null) {
        query = query.eq('conversation_id', conversationId)
      }
      query = query.select()

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async update({ userId, conversationId }, payload) {
      const { supabase } = getContext()

      const updates = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      )

      let query = supabase
        .from('conversation_participants')
        .update(changeKeys.snakeCase(updates, 6))
      if (userId != null) {
        query = query.eq('user_id', userId)
      }
      if (conversationId != null) {
        query = query.eq('conversation_id', conversationId)
      }
      query = query.select()

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async insert({ userId, conversationId }, payload) {
      const { supabase } = getContext()

      const updates = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      )

      let query = supabase
        .from('conversation_participants')
        .insert({
          ...changeKeys.snakeCase(updates),
          user_id: userId,
          conversation_id: conversationId,
        })
        .select()
        .single()

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data)
    },
  }
}
