declare global {
  type MessageType = 'user' | 'agent' | 'system';
  type MessageStatus = 'sending' | 'sent' | 'failed' | 'deleting' | 'deleted';

  type MessageData = {
    agentId?: string
    modelId?: string
    type: MessageType
    content: string
    extra: string
    hint?: string
  };

  type MessageRaw = MessageData & {
    id: string
    conversationId: string
    senderId?: string

    senderName?: string
    senderAvatar?: string
    agentName?: string
    agentInteractionMode?: AgentInteractionMode | null
    agentUpdatedAt?: string
    modelName?: string
    status: MessageStatus

    createdAt: string
    updatedAt: string
  };

  type Message = MessageData & {
    id: string
    conversationId: string
    senderId?: string

    senderName: string
    senderAvatar: string
    agentName: string
    agentInteractionMode: AgentInteractionMode
    agentUpdatedAt?: Date
    modelName: string
    status: MessageStatus

    isOwn: boolean
    initial: string

    createdAt: Date
    updatedAt: Date
  };
}

export {};
