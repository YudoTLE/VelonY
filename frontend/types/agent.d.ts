declare global {
  type AgentVisibility = 'private' | 'public' | 'default';

  type AgentData = {
    visibility: AgentVisibility
    name: string
    systemPrompt: string
    temperature: number
  };

  type AgentRaw = AgentData & {
    id: string
    creatorId: string

    createdAt: string
    updatedAt: string
  };

  type Agent = AgentData & {
    id: string
    creatorId: string

    isOwn: boolean
    url: string

    createdAt: Date
    updatedAt: Date
  };

  type AgentCache = {
    list: Agent[]
    registry: Map<string, Agent>
  };
}

export {};
