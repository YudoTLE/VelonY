CREATE OR REPLACE FUNCTION update_agent(
  agent_id      UUID,
  visibility    VARCHAR(20),
  name          VARCHAR(100),
  system_prompt TEXT,
  temperature   REAL
)
RETURNS SETOF enriched_agents AS $$
BEGIN
  UPDATE agents
  SET
    visibility    = COALESCE(update_agent.visibility, agents.visibility),
    name          = COALESCE(update_agent.name, agents.name),
    system_prompt = COALESCE(update_agent.system_prompt, agents.system_prompt),
    temperature   = COALESCE(update_agent.temperature, agents.temperature),
    updated_at    = now()
  WHERE id = update_agent.agent_id;

  UPDATE users
  SET updated_at = now()
  WHERE id = auth.uid();

  RETURN QUERY
  SELECT * FROM enriched_agents
  WHERE id = update_agent.agent_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;