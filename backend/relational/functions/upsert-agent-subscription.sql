CREATE OR REPLACE FUNCTION upsert_agent_subscription(
  user_id UUID,
  agent_id UUID
)
RETURNS agent_subscriptions AS $$
DECLARE
  _upserted_agent agent_subscriptions%ROWTYPE;
BEGIN
  INSERT INTO agent_subscriptions (user_id, agent_id)
  VALUES (
    upsert_agent_subscription.user_id,
    upsert_agent_subscription.agent_id
  )
  ON CONFLICT (user_id, agent_id)
  DO UPDATE SET updated_at = now()
  RETURNING * INTO _upserted_agent;

  RETURN _upserted_agent;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;