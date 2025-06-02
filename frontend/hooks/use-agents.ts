import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useMe } from '@/hooks/use-users'

import { AgentRaw, Agent, processRawAgents, AgentData, processRawAgent, AgentCache } from '@/types/agent.types'

import api from '@/lib/axios'

export const useFetchAgents = () => {
  const { data: me } = useMe()

  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      if (!me) {
        throw new Error('Unauthenticated')
      }

      const { data: agentsRaw } = await api.get<AgentRaw[]>('agents')

      const list = processRawAgents(agentsRaw, { selfId: me.id })
      const registry = new Map<string, Agent>()
      
      list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      for (const agent of list) {
        registry.set(agent.id, agent)
      }

      return {
        list,
        registry,
      }
    }
  })
}

export const useUpdateAgent = (agentId: string) => {
  const queryClient = useQueryClient()
  const { data: me } = useMe()

  return useMutation({
    mutationFn: async (payload: Partial<AgentData>) => {
      if (!me) {
        throw new Error('Unauthenticated')
      }

      const { data: updatedAgentRaw } = await api.patch<AgentRaw>(`agents/${agentId}`, payload)
      const updatedAgent = processRawAgent(updatedAgentRaw, { selfId: me.id })

      return updatedAgent
    },

    onSuccess: (data) => {
      queryClient.setQueryData(
        ['agents'],
        ((oldCache?: AgentCache) => {
          const old: AgentCache = oldCache || {
            list: [],
            registry: new Map()
          }

          const newList = [...old.list]
          const newRegistry = new Map(old.registry)

          const at = newList.findIndex(agent => agent.id === data.id)
          if (at !== -1) {
            newList.splice(at, 1)
          }
          newList.unshift(data)
          newRegistry.set(data.id, data)

          return {
            list: newList,
            registry: newRegistry,
          }
        })
      )
    }
  })
}

export const useCreateAgent = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: me } = useMe()

  return useMutation({
    mutationFn: async (payload: Required<AgentData>) => {
      if (!me) {
        throw new Error('Unauthenticated')
      }

      const { data: newAgentRaw } = await api.post<AgentRaw>(`agents`, payload)
      const newAgent = processRawAgent(newAgentRaw, { selfId: me.id })

      return newAgent
    },

    onSuccess: (data) => {
      queryClient.setQueryData(
        ['agents'],
        ((oldCache?: AgentCache) => {
          const old: AgentCache = oldCache || {
            list: [],
            registry: new Map()
          }

          const newList = [data, ...old.list]
          const newRegistry = new Map(old.registry)
          
          newRegistry.set(data.id, data)

          return {
            list: newList,
            registry: newRegistry,
          }
        })
      )

      router.push(data.url)
    }
  })
}