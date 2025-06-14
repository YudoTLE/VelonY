import { getContext } from '../lib/async-local-storage.js'

export default function ModelService({ repo }) {
  return {
    async list(query) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }

      const models = 'subscriberId' in query
        ? await repo.modelSubscription
            .select({ userId: query.subscriberId })
            .then(subs => repo.model.select({ ...query, modelIds: subs.map(s => s.modelId) }))
        : await repo.model.select(query)
      
      const uniq = (arr) => [...new Set(arr)]
      const modelIds = uniq(models.map(a => a.id))

      const subscriptions = await repo.modelSubscription.select({ modelIds })

      const subscriptionMap = new Map()
      for (const { modelId, userId } of subscriptions) {
        if (!subscriptionMap.has(modelId)) {
          subscriptionMap.set(modelId, new Set())
        }
        subscriptionMap.get(modelId).add(userId)
      }

      const enrichedModels = models.map(a => {
        const set = subscriptionMap.get(a.id)
        return {
          ...a,
          isSubscribed: set?.has(user.sub) ?? false,
          subscriberCount: set?.size ?? 0,
        }
      })
      
      return enrichedModels
    },

    async get(modelId) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }
      
      const [[model], subscriptions] = await Promise.all([
        repo.model.select({ modelId }),
        repo.modelSubscription.select({ modelId }),
      ])
      if (!model) {
        throw { status: 404, message: 'Model not found' }
      }

      const enrichedModel = {
        ...model,
        isSubscribed: subscriptions.some(sub => sub.userId === user.sub),
        subscriberCount: subscriptions.length
      }
      
      return enrichedModel
    },

    async update(modelId, payload) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }
    
      const promises = [
        repo.model.update({ modelId }, { ...payload, updatedAt: new Date() }),
        repo.modelSubscription.select({ modelId }),
      ]

      const willBePublic = payload?.visibility === 'public'
      if (!willBePublic) {
        promises.push(repo.modelSubscription.delete({ modelId }))
      } else {
        promises.push(Promise.resolve())
      }
    
      const [[model], subscriptions, _] = await Promise.all(promises)
  
      return {
        ...model,
        isSubscribed: subscriptions.some(s => s.userId === user.sub),
        subscriberCount: willBePublic ? subscriptions.length : 0,
      }
    },

    async create(payload) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }

      const [model] = await repo.model.insert([{...payload, creatorId: user.sub}])

      const enrichedModel = {
        ...model,
        isSubscribed: false,
        subscriberCount: 0,
      }

      return enrichedModel
    },

    async addSubscription({ userId, modelId }) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }

      const [[subscription], subscriptions, [model], ] = await Promise.all([
        repo.modelSubscription.insert([{ userId, modelId }]),
        repo.modelSubscription.select({ modelId }),
        repo.model.select({ modelId }),
      ])

      const enrichedModel = {
        ...model,
        isSubscribed: true,
        subscriberCount: new Set([
          ...subscriptions.map(cp => cp.userId),
          subscription.userId
        ]).size
      }

      return enrichedModel
    },

    async removeSubscription({ userId, modelId }) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }

      const [[subscription], subscriptions, [model], ] = await Promise.all([
        repo.modelSubscription.delete({ userId, modelId }),
        repo.modelSubscription.select({ modelId }),
        repo.model.select({ modelId }),
      ])

      const isSubscribed = false
      const subscriberIds = new Set(subscriptions.map(p => p.userId))
      const subscriberCount = subscriberIds.size - (subscriberIds.has(subscription.userId) ? 1 : 0)

      const enrichedModel = {
        ...model,
        isSubscribed,
        subscriberCount,
      }

      return enrichedModel
    },
  }
}