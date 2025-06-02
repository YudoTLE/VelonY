import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'

export default function ModelRepository() {
  return {
    async listForAll() {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .from('enriched_models')
        .select()
      if (error) throw new Error(error.message)
      return changeKeys.camelCase(data, 2)
    },

    async listForUser(userId) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .from('enriched_models')
        .select()
        .eq('creator_id', userId)
      if (error) throw new Error(error.message)
      return changeKeys.camelCase(data, 2)
    },

    async get(modelId) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .from('enriched_models')
        .select()
        .eq('id', modelId)
        .single()
      if (error) throw new Error(error.message)
      return changeKeys.camelCase(data)
    },

    async update(modelId, payload) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .rpc('update_model', {
          ...changeKeys.snakeCase(payload),
          model_id: modelId,
        })
        .single()
      if (error) throw new Error(error.message)
      return changeKeys.camelCase(data)
    },

    async createForUser(userId, payload) {
      const { supabase } = getContext()

      const { data, error } = await supabase
        .rpc('create_model', {
          ...changeKeys.snakeCase(payload),
          creator_id: userId,
        })
        .single()
      if (error) throw new Error(error.message)
      return changeKeys.camelCase(data)
    }
  }
}