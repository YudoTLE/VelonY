export type ModelVisibility = 'private' | 'public' | 'default'

export type ModelData = {
  visibility: ModelVisibility
  name: string
  llmModel: string
  endpointUrl: string
  apiKey?: string
}

export type ModelRaw = ModelData & {
  id: string
  creatorId: string

  createdAt: string
  updatedAt: string
}

export type Model = ModelData & {
  id: string
  creatorId: string

  isOwn: boolean
  url: string
  
  createdAt: Date
  updatedAt: Date
}

export type ModelCache = {
  list: Model[]
  registry: Map<string, Model>
}

export const processRawModel = (
  raw: ModelRaw,
  config: { selfId: string },
): Model => {
  const isOwn = !!config.selfId && config.selfId === raw.creatorId

  return {
    ...raw,
    isOwn,
    url: `/m/${raw.id}`,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  }
}

export const processRawModels = (
  raws: ModelRaw[],
  config: { selfId: string },
): Model[] => {
  return raws.map(model => processRawModel(model, config))
}