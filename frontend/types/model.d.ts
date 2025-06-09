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
    llmModel: string
    endpointUrl: string
    apiKey?: string
    preset: string
    config: ModelConfigField[]
  };

  type ModelRaw = ModelData & {
    id: string
    creatorId: string

    userId?: string
    recentlyUsedAt?: string
    subscriberCount?: number

    createdAt: string
    updatedAt: string
  };

  type Model = ModelData & {
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
