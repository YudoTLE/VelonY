import * as changeKeys from 'change-case/keys'
import { getContext } from '../lib/async-local-storage.js'
import { mapSupabaseError } from '../lib/error.js'

export default function UserRepository() {
  return {
    async select(filter = {}) {
      const { supabase } = getContext()

      let query = supabase
        .from('enriched_users')
        .select()
      if (filter.userId != null) {
        query = query.eq('id', filter.userId)
      }
      if (Array.isArray(filter.userIds)) {
        query = query.in('id', filter.userIds)
      }

      const { data, error } = await query

      if (error) throw mapSupabaseError(error)
      return changeKeys.camelCase(data, 2)
    },

    async upsert(payload = {}) {
      const { supabase } = getContext()

      const { error: errorUpsert } = await supabase
        .from('users')
        .upsert(changeKeys.snakeCase(payload, 2))
        
      if (errorUpsert) throw mapSupabaseError(errorUpsert)

      const { data, error: errorSelect } = await supabase
        .from('enriched_users')
        .select()
        .eq('id', payload.id)
    
      if (errorSelect) throw mapSupabaseError(errorSelect)
      return changeKeys.camelCase(data, 2)
    },
  }
}