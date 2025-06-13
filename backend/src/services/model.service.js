import { getContext } from '../lib/async-local-storage.js'

export default function ModelService({ repo }) {
  return {
    async list(query) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }
      
      return await repo.model.select(query)
    },

    async get(modelId) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }
      
      const model = (await repo.model.select({ modelId }))[0]
      if (!model) {
        throw { status: 404, message: 'Model not found' }
      }
      
      return model
    },

    async update(modelId, payload) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }
      
      const promises = []
      if (payload?.visibility !== 'public') {
        promises.push(repo.modelSubscription.delete({ modelId }))
      } else {
        promises.push(Promise.resolve())
      }
      promises.push(repo.model.update({ modelId }, payload))

      const [_, updated] = await Promise.all(promises)
      return updated[0]
    },
    
    async create(payload) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }

      return await repo.model.insert({ ...payload, creatorId: user.sub })
    },

    async addSubscription({ userId, modelId }) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }

      await repo.modelSubscription.insert({ userId, modelId })
      return (await repo.model.select({ userId, modelId }))[0]
    },

    async removeSubscription({ userId, modelId }) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }

      await repo.modelSubscription.delete({ userId, modelId })
      return (await repo.model.select({ modelId }))[0]
    },
  }
}