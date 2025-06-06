export type MessageType = 'user' | 'agent' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'failed' | 'deleting' | 'deleted';

export type MessageData = {
  agentId?: string
  modelId?: string
  type: MessageType
  content: string
  extra: string
};

export type MessageRaw = MessageData & {
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

export type Message = MessageData & {
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

export type MessageCache = {
  list: Message[]
  registry: Map<string, Message>
};

export const processRawMessage = (
  raw: MessageRaw,
  config: {
    selfId: string
    status: MessageStatus
  },
): Message => {
  const isOwn = !!config.selfId && config.selfId === raw.senderId;
  const senderName = isOwn ? 'You' : raw.senderName || '<VelonY User>';
  const senderAvatarUrl = raw.senderAvatarUrl || '';
  const agentName = raw.agentName || '<VelonY Agent>';
  const modelName = raw.modelName || '<VelonY Model>';
  const initial = (raw.type === 'user' ? senderName : agentName)
    .trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();

  return {
    ...raw,
    senderName,
    senderAvatarUrl,
    agentName,
    modelName,
    status: config.status || 'sending',
    isOwn,
    initial,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
};

export const processRawMessages = (
  raws: MessageRaw[],
  config: {
    selfId: string
    status: MessageStatus
  },
): Message[] => {
  return raws.map(message => processRawMessage(message, config));
};

export const createOptimisticMessage = (
  content: string,
  conversationId: string,
): Message => {
  const now = new Date();
  const tempId = `t-${crypto.randomUUID()}`;

  return {
    id: tempId,
    conversationId,
    type: 'user',
    content,
    extra: '',
    senderName: 'You',
    senderAvatarUrl: '',
    agentName: '',
    modelName: '',
    status: 'sending',
    isOwn: true,
    initial: '',
    createdAt: now,
    updatedAt: now,
  };
};
