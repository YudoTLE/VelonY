import { getContext } from '../lib/async-local-storage.js'

export default function ModelService({ repo }) {
  return {
    async list() {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthorized' }
      return await repo.model.listForUser(user.sub)
    },

    async get(modelId) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthorized' }
      return await repo.model.get(modelId)
    },

    async update(id, payload) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthorized' }
      return await repo.model.update(id, payload)
    },

    async create(payload) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthorized' }
      return await repo.model.createForUser(user.sub, payload)
    }
  }
}