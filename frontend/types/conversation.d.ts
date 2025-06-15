declare global {
  type ConversationRole = 'creator' | 'admin' | 'member';
  type ConversationParticipantRaw = {
    role: ConversationRole
    user: UserRaw
  };
  type ConversationParticipant = {
    role: ConversationRole
    user: User
  };

  type ConversationData = {
    title: string
  };

  type ConversationRaw = ConversationData & {
    id: string
    creatorId: string

    participants: ConversationParticipantRaw[]

    createdAt: string
    updatedAt: string
  };

  type Conversation = ConversationData & {
    id: string
    creatorId: string

    participants: ConversationParticipant[]

    createdAt: Date
    updatedAt: Date

    isOwn: boolean
    url: string
  };
}

export {};
