CREATE OR REPLACE FUNCTION get_conversations(
  user_id UUID
)
RETURNS SETOF enriched_conversations AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM enriched_conversations ec
  WHERE ec.user_id = get_conversations.user_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;