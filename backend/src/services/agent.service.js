import { getContext } from '../lib/async-local-storage.js'

export default function AgentService({ repo }) {
  return {
    async list() {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }
      return await repo.agent.listForUser(user.sub)
    },

    async get(agentId) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }
      return await repo.agent.get(agentId)
    },

    async update(id, payload) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }
      return await repo.agent.update(id, payload)
    },

    async create(payload) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }
      return await repo.agent.createForUser(user.sub, payload)
    }
  }
}