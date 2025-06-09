CREATE OR REPLACE FUNCTION create_conversation(
  creator_id UUID,
  title      TEXT,
  type       VARCHAR(10)
)
RETURNS SETOF enriched_conversations AS $$
DECLARE
  _conversation_id UUID;
BEGIN
  INSERT INTO conversations (creator_id, title, type)
  VALUES (
    create_conversation.creator_id,
    create_conversation.title,
    create_conversation.type
  )
  RETURNING id INTO _conversation_id;

  INSERT INTO conversation_participants (user_id, conversation_id, role)
  VALUES (
    create_conversation.creator_id,
    _conversation_id,
    'admin'
  );

  UPDATE users
  SET updated_at = now()
  WHERE id = create_conversation.creator_id;

  RETURN QUERY
  SELECT * FROM enriched_conversations
  WHERE id = _conversation_id AND user_id = create_conversation.creator_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
