export const getAgentAvatarUrl = (agentId?: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_AGENT_AVATAR_BASE_URL;

  if (!baseUrl || !agentId) {
    return '';
  }

  return `${baseUrl.replace(/\/$/, '')}/${agentId}.webp`;
};
