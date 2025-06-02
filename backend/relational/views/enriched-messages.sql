CREATE OR REPLACE VIEW enriched_messages AS
SELECT
  m.*,
  au.raw_user_meta_data ->> 'name' AS sender_name,
  au.raw_user_meta_data ->> 'avatar_url' AS sender_avatar_url,
  ag.name AS agent_name,
  mo.name AS model_name
FROM messages m
JOIN auth.users au ON m.sender_id = au.id
LEFT JOIN agents ag ON m.agent_id = ag.id
LEFT JOIN models mo ON m.model_id = mo.id;