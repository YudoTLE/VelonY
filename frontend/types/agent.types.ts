export type AgentVisibility = 'private' | 'public' | 'default'

export type AgentData = {
  visibility: AgentVisibility
  name: string
  systemPrompt: string
  temperature: number
}

export type AgentRaw = AgentData & {
  id: string
  creatorId: string

  createdAt: string
  updatedAt: string
}

export type Agent = AgentData & {
  id: string
  creatorId: string

  isOwn: boolean
  url: string

  createdAt: Date
  updatedAt: Date
}

export type AgentCache = {
  list: Agent[]
  registry: Map<string, Agent>
}

export const processRawAgent = (
  raw: AgentRaw,
  config: { selfId: string }
): Agent => {
  const isOwn = !!config.selfId && config.selfId === raw.creatorId

  return {
    ...raw,
    isOwn,
    url: `/a/${raw.id}`,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  }
}

export const processRawAgents = (
  raws: AgentRaw[],
  config: { selfId: string },
): Agent[] => {
  return raws.map(model => processRawAgent(model, config))
}