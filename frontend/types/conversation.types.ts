export type ConversationRole = 'admin' | 'member'

export type ConversationData = {
  title: string
}

export type ConversationRaw = ConversationData & {
  id: string
  creatorId: string

  role: ConversationRole
  memberCount: number

  createdAt: string
  updatedAt: string
}

export type Conversation = ConversationData & {
  id: string
  creatorId: string

  role: ConversationRole
  memberCount: number

  createdAt: Date
  updatedAt: Date

  isOwn: boolean
  url: string
}

export type ConversationCache = {
  list: Conversation[]
  registry: Map<string, Conversation>
}

export const processRawConversation = (
  raw: ConversationRaw,
  config: { selfId: string }
): Conversation => {
  const isOwn = !!config.selfId && config.selfId === raw.creatorId

  return {
    ...raw,
    url: `/c/${raw.id}`,
    isOwn,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  }
}

export const processRawConversations = (
  raws: ConversationRaw[],
  config: { selfId: string },
): Conversation[] => {
  return raws.map(conversation => processRawConversation(conversation, config))
}