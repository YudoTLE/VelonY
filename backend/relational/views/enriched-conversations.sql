CREATE OR REPLACE VIEW enriched_conversations AS
SELECT
  c.*,
  cp.role AS user_role,
  cp.user_id,
  pc.member_count
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
JOIN (
  SELECT conversation_id, COUNT(*) AS member_count
  FROM conversation_participants
  GROUP BY conversation_id
) pc ON c.id = pc.conversation_id;