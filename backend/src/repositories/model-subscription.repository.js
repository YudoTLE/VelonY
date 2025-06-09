import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'
import { mapSupabaseError } from '../lib/error.js'

export default function ModelSubscriptionRepository() {
  return {
    async select({ userId, modelId }) {
      const { supabase } = getContext()

      let query = supabase
        .from('model_subscriptions')
        .select()
      if (userId != null) {
        query = query.eq('user_id', userId)
      }
      if (modelId != null) {
        query = query.eq('model_id', modelId)
      }

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async delete({ userId, modelId }) {
      const { supabase } = getContext()

      let query = supabase
        .from('model_subscriptions')
        .delete()
      if (userId != null) {
        query = query.eq('user_id', userId)
      }
      if (modelId != null) {
        query = query.eq('model_id', modelId)
      }
      query = query.select()

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async update({ userId, modelId }, payload) {
      const { supabase } = getContext()

      const updates = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      )

      let query = supabase
        .from('model_subscriptions')
        .update(changeKeys.snakeCase(updates))
      if (userId != null) {
        query = query.eq('user_id', userId)
      }
      if (modelId != null) {
        query = query.eq('model_id', modelId)
      }
      query = query.select()

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async insert({ userId, modelId }, payload = {}) {
      const { supabase } = getContext()

      const updates = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      )

      let query = supabase
        .from('model_subscriptions')
        .insert({
          ...changeKeys.snakeCase(updates),
          user_id: userId,
          model_id: modelId,
        })
        .select()
        .single()

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data)
    },
  }
}
