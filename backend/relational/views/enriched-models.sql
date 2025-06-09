CREATE OR REPLACE VIEW enriched_models
WITH (security_invoker = true) AS
SELECT
  m.*,
  s.user_id AS user_id,
  s.updated_at AS recently_used_at,
  sc.subscriber_count
FROM models m
LEFT JOIN model_subscriptions s ON s.model_id = m.id
LEFT JOIN (
  SELECT model_id, COUNT(*) AS subscriber_count
  FROM model_subscriptions as sub
  JOIN models m2 ON sub.model_id = m2.id
  GROUP BY model_id
) sc ON m.id = sc.model_id;