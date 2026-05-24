export const DEFAULT_AGENT_INTERACTION_MODE: AgentInteractionMode = 'assistant';

export const parseAgentInteractionMode = (
  value: unknown,
  fallback: AgentInteractionMode = DEFAULT_AGENT_INTERACTION_MODE,
): AgentInteractionMode => {
  if (value === 'assistant' || value === 'participant') {
    return value;
  }

  return fallback;
};
