import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'

export default function ConversationRepository() {
  return {
    async delete(conversationId) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .rpc('delete_conversation', {
          conversation_id: conversationId
        })
        .single()
      if (error) throw new Error(error.message)
      return changeKeys.camelCase(data)
    },

    async listForUser(userId) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .rpc('get_conversations', {
          user_id: userId
        })
      if (error) throw new Error(error.message)
      return changeKeys.camelCase(data, 2)
    },

    async createForUser(userId, payload) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .rpc('create_conversation', {
          ...changeKeys.snakeCase(payload),
          creator_id: userId,
        })
        .single()
      if (error) throw new Error(error.message)
      return changeKeys.camelCase(data)
    },
  }
}
