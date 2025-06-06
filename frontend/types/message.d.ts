declare global {
  type MessageType = 'user' | 'agent' | 'system';
  type MessageStatus = 'sending' | 'sent' | 'failed' | 'deleting' | 'deleted';

  type MessageData = {
    agentId?: string
    modelId?: string
    type: MessageType
    content: string
    extra: string
  };

  type MessageRaw = MessageData & {
    id: string
    conversationId: string
    senderId?: string

    senderName?: string
    senderAvatarUrl?: string
    agentName?: string
    modelName?: string

    createdAt: string
    updatedAt: string
  };

  type Message = MessageData & {
    id: string
    conversationId: string
    senderId?: string

    senderName: string
    senderAvatarUrl: string
    agentName: string
    modelName: string

    status: MessageStatus
    isOwn: boolean
    initial: string

    createdAt: Date
    updatedAt: Date
  };

  type MessageCache = {
    list: Message[]
    registry: Map<string, Message>
  };
}

export {};
