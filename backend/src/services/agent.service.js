import { getContext } from '../lib/async-local-storage.js'

const getMaxAvatarBytes = () =>
  Number(process.env.AGENT_AVATAR_MAX_BYTES || 5 * 1024 * 1024)

const stripDataUrlPrefix = (value) => {
  const commaIndex = value.indexOf(',')
  return value.startsWith('data:') && commaIndex !== -1
    ? value.slice(commaIndex + 1)
    : value
}

const hasExpectedImageSignature = (contentType, body) => {
  if (contentType === 'image/webp') {
    return body.subarray(0, 4).toString('ascii') === 'RIFF'
      && body.subarray(8, 12).toString('ascii') === 'WEBP'
  }

  return false
}

export default function AgentService({ repo, avatarStorage }) {
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
        const isOwn = a.creatorId === user.sub
        const showDetails = isOwn || a.showDetails

        return {
          ...a,
          systemPrompt: showDetails ? a.systemPrompt : null,
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

      const isOwn = agent.creatorId === user.sub
      const showDetails = isOwn || agent.showDetails

      const enrichedAgent = {
        ...agent,
        systemPrompt: showDetails ? agent.systemPrompt : null,
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

      const enrichedAgent = {
        ...agent,
        isSubscribed: subscriptions.some(s => s.userId === user.sub),
        subscriberCount: willBePublic ? subscriptions.length : 0,
      }

      return enrichedAgent
    },

    async updateAvatar(agentId, payload) {
      const { user } = getContext()
      if (!user) throw { status: 401, message: 'Unauthenticated' }

      const [existingAgent] = await repo.agent.select({ agentId })
      if (!existingAgent) {
        throw { status: 404, message: 'Agent not found' }
      }
      if (existingAgent.creatorId !== user.sub) {
        throw { status: 403, message: 'Forbidden' }
      }

      const contentType = payload?.contentType
      if (contentType !== 'image/webp') {
        throw { status: 415, message: 'Avatar must be uploaded as a WEBP image' }
      }

      const base64Data = typeof payload?.data === 'string'
        ? stripDataUrlPrefix(payload.data).replace(/\s/g, '')
        : ''

      if (!base64Data) {
        throw { status: 400, message: 'Avatar image is required' }
      }

      const body = Buffer.from(base64Data, 'base64')
      const maxAvatarBytes = getMaxAvatarBytes()
      if (body.length === 0) {
        throw { status: 400, message: 'Avatar image is empty' }
      }
      if (body.length > maxAvatarBytes) {
        throw {
          status: 413,
          message: `Avatar image must be smaller than ${Math.floor(maxAvatarBytes / 1024 / 1024)}MB`,
        }
      }
      if (!hasExpectedImageSignature(contentType, body)) {
        throw { status: 415, message: 'Avatar image type does not match the uploaded file' }
      }

      await avatarStorage.putAgentAvatar({
        agentId,
        body,
        contentType,
      })

      const [[agent], subscriptions] = await Promise.all([
        repo.agent.update({ agentId, creatorId: user.sub }, { updatedAt: new Date() }),
        repo.agentSubscription.select({ agentId }),
      ])

      if (!agent) {
        throw { status: 404, message: 'Agent not found' }
      }

      const enrichedAgent = {
        ...agent,
        isSubscribed: subscriptions.some(s => s.userId === user.sub),
        subscriberCount: agent.visibility === 'public' ? subscriptions.length : 0,
      }

      return enrichedAgent
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

      const isOwn = agent.creatorId === user.sub
      const showDetails = isOwn || agent.showDetails

      const enrichedAgent = {
        ...agent,
        systemPrompt: showDetails ? agent.systemPrompt : null,
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

      const isOwn = agent.creatorId === user.sub
      const showDetails = isOwn || agent.showDetails

      const enrichedAgent = {
        ...agent,
        systemPrompt: showDetails ? agent.systemPrompt : null,
        isSubscribed,
        subscriberCount,
      }

      return enrichedAgent
    },
  }
}
