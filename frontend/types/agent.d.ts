declare global {
  type AgentVisibility = 'private' | 'public' | 'default';

  type AgentData = {
    visibility: AgentVisibility
    name: string
    description: string
    systemPrompt: string
  };

  type AgentRaw = AgentData & {
    id: string
    creatorId: string

    userId?: string
    recentlyUsedAt?: string
    subscriberCount?: number

    createdAt: string
    updatedAt: string
  };

  type Agent = AgentData & {
    id: string
    creatorId: string

    userId?: string
    recentlyUsedAt: Date
    subscriberCount: number

    isOwn: boolean
    isSubscribed: boolean
    isEditable: boolean
    url: string

    createdAt: Date
    updatedAt: Date
  };
}

export {};
