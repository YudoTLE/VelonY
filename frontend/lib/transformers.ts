export const processRawUser = (
  raw: UserRaw,
): User => {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
};

export const processRawUsers = (
  raws: UserRaw[],
): User[] => {
  return raws.map(user => processRawUser(user));
};

export const processRawMessage = (
  raw: MessageRaw,
  config: {
    selfId: string
  },
): Message => {
  const isOwn = !!config.selfId && config.selfId === raw.senderId;
  const senderName = isOwn ? 'You' : raw.senderName || '<VelonY User>';
  const senderAvatar = raw.senderAvatar || '';
  const agentName = raw.agentName || '<VelonY Agent>';
  const modelName = raw.modelName || '<VelonY Model>';
  const initial = (raw.type === 'user' ? senderName : agentName)
    .trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();

  return {
    ...raw,
    senderName,
    senderAvatar,
    agentName,
    modelName,
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
  },
): Message[] => {
  return raws.map(message => processRawMessage(message, config));
};

export const processRawConversation = (
  raw: ConversationRaw,
  config: { selfId: string },
): Conversation => {
  const isOwn = !!config.selfId && config.selfId === raw.creatorId;
  const participants = raw.participants.map(p => ({
    role: p.role,
    user: processRawUser(p.user),
  }));

  return {
    ...raw,
    participants,
    url: `/c/${raw.id}`,
    isOwn,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
};

export const processRawConversations = (
  raws: ConversationRaw[],
  config: { selfId: string },
): Conversation[] => {
  return raws.map(conversation => processRawConversation(conversation, config));
};

export const processRawAgent = (
  raw: AgentRaw,
  config: { selfId: string },
): Agent => {
  const isOwn = !!config.selfId && config.selfId === raw.creatorId;
  const isEditable = isOwn && (raw.visibility !== 'default');
  const subscriberCount = raw.subscriberCount ?? 0;

  return {
    ...raw,
    subscriberCount,
    isOwn,
    isEditable,
    url: `/a/${raw.id}`,
    recentlyUsedAt: raw.recentlyUsedAt ? new Date(raw.recentlyUsedAt) : new Date(raw.updatedAt),
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
};

export const processRawAgents = (
  raws: AgentRaw[],
  config: { selfId: string },
): Agent[] => {
  return raws.map(model => processRawAgent(model, config));
};

export const processRawModel = (
  raw: ModelRaw,
  config: { selfId: string },
): Model => {
  const isOwn = !!config.selfId && config.selfId === raw.creatorId;
  const isEditable = isOwn && (raw.visibility !== 'default');
  const subscriberCount = raw.subscriberCount ?? 0;

  return {
    ...raw,
    subscriberCount,
    isOwn,
    isEditable,
    url: `/m/${raw.id}`,
    recentlyUsedAt: raw.recentlyUsedAt ? new Date(raw.recentlyUsedAt) : new Date(raw.updatedAt),
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
};

export const processRawModels = (
  raws: ModelRaw[],
  config: { selfId: string },
): Model[] => {
  return raws.map(model => processRawModel(model, config));
};
