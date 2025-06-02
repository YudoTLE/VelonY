CREATE OR REPLACE FUNCTION get_participants(
  conversation_id UUID
)
RETURNS SETOF enriched_users AS $$
BEGIN
  RETURN QUERY
  SELECT eu.*
  FROM enriched_users eu
  JOIN conversation_participants cp ON eu.id = cp.user_id
  WHERE cp.conversation_id = get_participants.conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
