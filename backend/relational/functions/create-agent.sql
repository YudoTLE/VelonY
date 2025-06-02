CREATE OR REPLACE FUNCTION create_agent(
  creator_id    UUID,
  name          TEXT,
  system_prompt TEXT,
  temperature   REAL
)
RETURNS SETOF enriched_agents AS $$
DECLARE
  _agent_id UUID;
BEGIN
  INSERT INTO agents (creator_id, name, system_prompt, temperature)
  VALUES (create_agent.creator_id, create_agent.name, create_agent.system_prompt, create_agent.temperature)
  RETURNING id INTO _agent_id;
  
  UPDATE users
  SET updated_at = now()
  WHERE id = create_agent.creator_id;

  RETURN QUERY
  SELECT * FROM enriched_agents WHERE id = _agent_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;