export const getAgentAvatarUrl = (
  agentId?: string,
  version?: Date | string | number,
) => {
  const baseUrl = process.env.NEXT_PUBLIC_AGENT_AVATAR_BASE_URL;

  if (!baseUrl || !agentId) {
    return '';
  }

  const url = `${baseUrl.replace(/\/$/, '')}/${agentId}.webp`;
  if (!version) {
    return url;
  }

  const resolvedVersion = version instanceof Date ? version.getTime() : version;
  return `${url}?v=${encodeURIComponent(String(resolvedVersion))}`;
};
