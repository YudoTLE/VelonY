import { getContext } from '../lib/async-local-storage.js'

export default function AgentService({ repo }) {
  return {
    async list(query) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }

      const agents = 'subscriberId' in query
        ? await repo.agentSubscription
            .select({ userId: query.subscriberId })
            .then(subs => repo.agent.select({ ...query, agentIds: subs.map(s => s.agentId) }))
        : await repo.agent.select(query)
      
      const uniq = (arr) => [...new Set(arr)]
      const agentIds = uniq(agents.map(a => a.id))

      const subscriptions = await repo.agentSubscription.select({ agentIds })

      const subscriptionMap = new Map()
      for (const { agentId, userId } of subscriptions) {
        if (!subscriptionMap.has(agentId)) {
          subscriptionMap.set(agentId, new Set())
        }
        subscriptionMap.get(agentId).add(userId)
      }

      const enrichedAgents = agents.map(a => {
        const set = subscriptionMap.get(a.id)
        return {
          ...a,
          isSubscribed: set?.has(user.sub) ?? false,
          subscriberCount: set?.size ?? 0,
        }
      })
      
      return enrichedAgents
    },

    async get(agentId) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }
      
      const [[agent], subscriptions] = await Promise.all([
        repo.agent.select({ agentId }),
        repo.agentSubscription.select({ agentId }),
      ])
      if (!agent) {
        throw { status: 404, message: 'Agent not found' }
      }

      const enrichedAgent = {
        ...agent,
        isSubscribed: subscriptions.some(sub => sub.userId === user.sub),
        subscriberCount: subscriptions.length
      }
      
      return enrichedAgent
    },

    async update(agentId, payload) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }
    
      const promises = [
        repo.agent.update({ agentId }, { ...payload, updatedAt: new Date() }),
        repo.agentSubscription.select({ agentId }),
      ]

      const willBePublic = payload?.visibility === 'public'
      if (!willBePublic) {
        promises.push(repo.agentSubscription.delete({ agentId }))
      } else {
        promises.push(Promise.resolve())
      }
    
      const [[agent], subscriptions, _] = await Promise.all(promises)
  
      return {
        ...agent,
        isSubscribed: subscriptions.some(s => s.userId === user.sub),
        subscriberCount: willBePublic ? subscriptions.length : 0,
      }
    },

    async create(payload) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }

      const [agent] = await repo.agent.insert([{...payload, creatorId: user.sub}])

      const enrichedAgent = {
        ...agent,
        isSubscribed: false,
        subscriberCount: 0,
      }

      return enrichedAgent
    },

    async delete(agentId) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }

      const [agent] = await repo.agent.delete({ agentId })

      const enrichedAgent = {
        ...agent,
        isSubscribed: false,
        subscriberCount: 0,
      }

      return enrichedAgent
    },

    async addSubscription({ userId, agentId }) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }

      const [[subscription], subscriptions, [agent], ] = await Promise.all([
        repo.agentSubscription.insert([{ userId, agentId }]),
        repo.agentSubscription.select({ agentId }),
        repo.agent.select({ agentId }),
      ])

      const enrichedAgent = {
        ...agent,
        isSubscribed: true,
        subscriberCount: new Set([
          ...subscriptions.map(cp => cp.userId),
          subscription.userId
        ]).size
      }

      return enrichedAgent
    },

    async removeSubscription({ userId, agentId }) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }

      const [[subscription], subscriptions, [agent], ] = await Promise.all([
        repo.agentSubscription.delete({ userId, agentId }),
        repo.agentSubscription.select({ agentId }),
        repo.agent.select({ agentId }),
      ])

      const isSubscribed = false
      const subscriberIds = new Set(subscriptions.map(p => p.userId))
      const subscriberCount = subscriberIds.size - (subscriberIds.has(subscription.userId) ? 1 : 0)

      const enrichedAgent = {
        ...agent,
        isSubscribed,
        subscriberCount,
      }

      return enrichedAgent
    },
  }
}