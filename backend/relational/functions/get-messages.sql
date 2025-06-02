CREATE OR REPLACE FUNCTION get_messages(
  conversation_id UUID,
  max_token       INT DEFAULT NULL
)
RETURNS SETOF enriched_messages AS $$
BEGIN
  IF max_token IS NULL THEN
    RETURN QUERY
      SELECT *
      FROM enriched_messages em
      WHERE em.conversation_id = get_messages.conversation_id
      ORDER BY created_at DESC;
  ELSE
    RETURN QUERY
      SELECT *
      FROM enriched_messages em
      WHERE em.conversation_id = get_messages.conversation_id
      ORDER BY created_at DESC
      LIMIT max_token;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;