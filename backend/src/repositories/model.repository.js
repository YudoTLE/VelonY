import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'
import { mapSupabaseError } from '../lib/error.js'

export default function ModelRepository() {
  return {
    async select(query) {
      const { supabase } = getContext()

      let dbQuery = supabase
        .from('enriched_models')
        .select()
      if (query.model_id != null) {
        dbQuery = dbQuery.eq('id', query.model_id)
      }
      if (query.creator_id != null) {
        dbQuery = dbQuery.eq('creator_id', query.creator_id)
      }
      if (query.user_id != null) {
        dbQuery = dbQuery.eq('user_id', query.user_id)
      }
      if (query.visibility != null) {
        dbQuery = dbQuery.eq('visibility', query.visibility)
      }

      const { data, error } = await dbQuery

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async update({ modelId, creatorId, userId, visibility }, payload = {}) {
      const { supabase } = getContext()

      const updates = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      )

      let query = supabase
        .from('models')
        .update(changeKeys.snakeCase(updates))
      if (modelId != null) {
        query = query.eq('id', modelId)
      }
      if (creatorId != null) {
        query = query.eq('creator_id', creatorId)
      }
      if (userId != null) {
        query = query.eq('user_id', userId)
      }
      if (visibility != null) {
        query = query.eq('visibility', visibility)
      }
      query = query.select()

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async delete({ modelId, creatorId, userId, visibility }) {
      const { supabase } = getContext()

      let query = supabase
        .from('models')
        .delete()
      if (modelId != null) {
        query = query.eq('id', modelId)
      }
      if (creatorId != null) {
        query = query.eq('creator_id', creatorId)
      }
      if (userId != null) {
        query = query.eq('user_id', userId)
      }
      if (visibility != null) {
        query = query.eq('visibility', visibility)
      }
      query = query.select()

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async insert(payload = {}) {
      const { supabase } = getContext()

      const fields = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      )

      const { data, error } = await supabase
        .from('models')
        .insert({
          ...changeKeys.snakeCase(fields),
        })
        .select()
        .single()

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data)
    },
  }
}