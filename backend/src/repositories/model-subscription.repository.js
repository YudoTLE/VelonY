import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'
import { mapSupabaseError } from '../lib/error.js'

export default function ModelSubscriptionRepository() {
  return {
    async select(filter = {}) {
      const { supabase } = getContext()

      let query = supabase
        .from('model_subscriptions')
        .select()
      if (filter.userId != null) {
        query = query.eq('user_id', filter.userId)
      }
      if (filter.modelId != null) {
        query = query.eq('model_id', filter.modelId)
      }
      if (Array.isArray(filter.userIds)) {
        query = query.in('user_id', filter.userIds)
      }
      if (Array.isArray(filter.modelIds)) {
        query = query.in('model_id', filter.modelIds)
      }

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async delete(filter = {}) {
      const { supabase } = getContext()

      let query = supabase
        .from('model_subscriptions')
        .delete()
      if (filter.userId != null) {
        query = query.eq('user_id', filter.userId)
      }
      if (filter.modelId != null) {
        query = query.eq('model_id', filter.modelId)
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
        .from('model_subscriptions')
        .update(changeKeys.snakeCase(updates))
      if (filter.userId != null) {
        query = query.eq('user_id', filter.userId)
      }
      if (filter.modelId != null) {
        query = query.eq('model_id', filter.modelId)
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
        .from('model_subscriptions')
        .insert(changeKeys.snakeCase(inserts, 2))
        .select()

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },
  }
}
