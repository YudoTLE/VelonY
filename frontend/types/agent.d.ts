declare global {
  type AgentVisibility = 'private' | 'public' | 'default';

  type AgentData = {
    visibility: AgentVisibility
    name: string
    description: string
    showDetails: boolean
    systemPrompt: string | null
  };

  type AgentRaw = AgentData & {
    id: string
    creatorId: string

    isSubscribed: boolean
    recentlyUsedAt?: string
    subscriberCount: number

    createdAt: string
    updatedAt: string
  };

  type Agent = AgentData & {
    id: string
    creatorId: string

    isSubscribed: boolean
    recentlyUsedAt?: Date
    subscriberCount: number

    isOwn: boolean
    isEditable: boolean
    url: string

    createdAt: Date
    updatedAt: Date
  };
}

export {};
