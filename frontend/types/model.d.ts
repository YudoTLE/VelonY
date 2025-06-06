declare global {
  type ModelVisibility = 'private' | 'public' | 'default';

  type ModelData = {
    visibility: ModelVisibility
    name: string
    llmModel: string
    endpointUrl: string
    apiKey?: string
  };

  type ModelRaw = ModelData & {
    id: string
    creatorId: string

    createdAt: string
    updatedAt: string
  };

  type Model = ModelData & {
    id: string
    creatorId: string

    isOwn: boolean
    url: string

    createdAt: Date
    updatedAt: Date
  };

  type ModelCache = {
    list: Model[]
    registry: Map<string, Model>
  };
}

export {};
