import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'
import { mapSupabaseError } from '../lib/error.js'

export default function UserRepository() {
  return {
    async listForConversation(conversationId) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .rpc('get_participants', {
          conversation_id: conversationId
        })
      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async get(userId) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .rpc('get_user', {
          user_id: userId,
        })
        .single()
      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data)
    },

    async createOrUpdate(userId, payload) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .rpc('create_or_update_user', {
          ...changeKeys.snakeCase(payload),
          user_id: userId,
        })
        .single()
      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data)
    }
  }
}