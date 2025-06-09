import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'
import { mapSupabaseError } from '../lib/error.js'

export default function ConversationRepository() {
  return {
    async delete(conversationId) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .rpc('delete_conversation', {
          conversation_id: conversationId
        })
        .single()
      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 6)
    },

    async listForUser(userId) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .rpc('get_conversations', {
          user_id: userId
        })
      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 6)
    },

    async createForUser(userId, payload) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .rpc('create_conversation', {
          ...changeKeys.snakeCase(payload, 6),
          creator_id: userId,
        })
        .single()
      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 6)
    },
  }
}
