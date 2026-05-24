declare global {
  type AgentVisibility = 'private' | 'public' | 'default';
  type AgentInteractionMode = 'assistant' | 'participant';

  type AgentData = {
    visibility: AgentVisibility
    interactionMode: AgentInteractionMode
    name: string
    description: string
    showDetails: boolean
    systemPrompt: string | null
  };

  type AgentRaw = Omit<AgentData, 'interactionMode'> & {
    interactionMode?: AgentInteractionMode | null

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
