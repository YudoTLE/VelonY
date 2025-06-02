import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'

export default function MessageRepository() {
  return {
    async listForConversation(conversationId, { maxToken }) {
      const { supabase } = getContext()

      const { data, error } = await supabase.rpc('get_messages', {
        conversation_id: conversationId,
        max_token: maxToken,
      })
      if (error) throw new Error(error.message)
      data.reverse()
      return changeKeys.camelCase(data, 2)
    },

    async delete(messageId) {
      const { supabase } = getContext()

      const { data, error } = await supabase.
        rpc('delete_message', {
          message_id: messageId,
        })
        .single()
      if (error) throw new Error(error.message)
      return changeKeys.camelCase(data)
    },

    async createForUser(userId, payload) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .rpc('create_message', {
          agent_id: null,
          model_id: null,
          ...changeKeys.snakeCase(payload),
          sender_id: userId,
        })
        .single()
      if (error) throw new Error(error.message)
      return changeKeys.camelCase(data)
    }
  }
}