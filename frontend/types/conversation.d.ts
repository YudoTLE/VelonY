declare global {
  type ConversationRole = 'admin' | 'member';

  type ConversationData = {
    title: string
  };

  type ConversationRaw = ConversationData & {
    id: string
    creatorId: string

    role: ConversationRole
    memberCount: number

    createdAt: string
    updatedAt: string
  };

  type Conversation = ConversationData & {
    id: string
    creatorId: string

    role: ConversationRole
    memberCount: number

    createdAt: Date
    updatedAt: Date

    isOwn: boolean
    url: string
  };
}

export {};
