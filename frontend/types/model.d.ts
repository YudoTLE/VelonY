declare global {
  type ModelVisibility = 'private' | 'public' | 'default';
  type ModelFieldType = 'string' | 'float' | 'integer' | 'boolean';
  type ModelConfigField = {
    type: ModelFieldType
    name: string
    value: string | number | boolean
  };

  type ModelData = {
    visibility: ModelVisibility
    name: string
    description: string
    showDetails: boolean
    llm?: string
    endpoint?: string
    apiKey?: string
    config?: ModelConfigField[]
  };

  type ModelRaw = ModelData & {
    id: string
    creatorId: string

    isSubscribed: boolean
    recentlyUsedAt?: string
    subscriberCount: number

    createdAt: string
    updatedAt: string
  };

  type Model = ModelData & {
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
