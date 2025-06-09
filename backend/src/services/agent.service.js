import { getContext } from '../lib/async-local-storage.js'

export default function AgentService({ repo }) {
  return {
    async list() {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }
        
      const [userAgents, subscribedAgents, defaultAgents] = await Promise.all([
        repo.agent.select({ creatorId: user.sub }),
        repo.agent.select({ userId: user.sub }),
        repo.agent.select({ visibility: 'default' })
      ])
    
      const combined = [...userAgents, ...subscribedAgents, ...defaultAgents]
      const unique = Object.values(
        combined.reduce((acc, agent) => {
          acc[agent.id] = agent
          return acc
        }, {})
      )
    
      return unique
    },

    async get(agentId) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }
      
      const agent = (await repo.agent.select({ agentId }))[0]
      if (!agent) {
        throw { status: 404, message: 'Agent not found' }
      }
      
      return agent
    },

    async update(agentId, payload) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }

      const promises = []
      if (payload?.visibility !== 'public') {
        promises.push(repo.agentSubscription.delete({ agentId }))
      } else {
        promises.push(Promise.resolve())
      }
      promises.push(repo.agent.update({ agentId }, payload))

      const [_, updated] = await Promise.all(promises)
      return updated[0]
    },

    async create(payload) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }

      return await repo.agent.insert({ ...payload, creatorId: user.sub })
    },

    async addSubscription({ userId, agentId }) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }

      await repo.agentSubscription.insert({ userId, agentId })
      return (await repo.agent.select({ userId, agentId }))[0]
    },

    async removeSubscription({ userId, agentId }) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }

      await repo.agentSubscription.delete({ userId, agentId })
      return (await repo.agent.select({ agentId }))[0]
    },
  }
}