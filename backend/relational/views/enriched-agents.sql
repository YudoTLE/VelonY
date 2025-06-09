CREATE OR REPLACE VIEW enriched_agents 
WITH (security_invoker = true) AS
SELECT
  a.*,
  s.user_id AS user_id,
  s.updated_at AS recently_used_at,
  sc.subscriber_count
FROM agents a
LEFT JOIN agent_subscriptions s ON s.agent_id = a.id
LEFT JOIN (
  SELECT agent_id, COUNT(*) AS subscriber_count
  FROM agent_subscriptions as sub
  JOIN agents a2 ON sub.agent_id = a2.id
  GROUP BY agent_id
) sc ON a.id = sc.agent_id;