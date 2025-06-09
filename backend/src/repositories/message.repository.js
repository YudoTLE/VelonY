import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'
import { mapSupabaseError } from '../lib/error.js'

export default function MessageRepository() {
  return {
    async listForConversation(conversationId, { maxToken }) {
      const { supabase } = getContext()

      const { data, error } = await supabase.rpc('get_messages', {
        conversation_id: conversationId,
        max_token: maxToken,
      })
      if (error) throw mapSupabaseError(error)
      data.reverse()
      return changeKeys.camelCase(data, 6)
    },

    async update(messageId, payload) {
      const { supabase } = getContext()

      const { data, error } = await supabase.
        rpc('update_message', {
          type: null,
          content: null,
          extra: null,
          agent_id: null,
          model_id: null,
          ...changeKeys.snakeCase(payload, 6),
          message_id: messageId,
        })
        .single()
      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 6)
    },

    async delete(messageId) {
      const { supabase } = getContext()

      const { data, error } = await supabase.
        rpc('delete_message', {
          message_id: messageId,
        })
        .single()
      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 6)
    },

    async createForUser(userId, payload) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .rpc('create_message', {
          agent_id: null,
          model_id: null,
          ...changeKeys.snakeCase(payload, 6),
          sender_id: userId,
        })
        .single()
      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 6)
    }
  }
}