CREATE OR REPLACE FUNCTION create_message(
  sender_id       UUID,
  conversation_id UUID,
  type            VARCHAR(10),
  content         TEXT,
  extra           TEXT,
  
  agent_id        UUID DEFAULT NULL,
  model_id        UUID DEFAULT NULL
)
RETURNS SETOF enriched_messages AS $$
DECLARE
  _new_message_id UUID;
BEGIN
  INSERT INTO messages (sender_id, conversation_id, agent_id, model_id, type, content, extra)
  VALUES (
    create_message.sender_id,
    create_message.conversation_id,
    create_message.agent_id,
    create_message.model_id,
    create_message.type,
    create_message.content,
    create_message.extra
  )
  RETURNING id INTO _new_message_id;

  UPDATE users
  SET updated_at = now()
  WHERE id = create_message.sender_id;

  UPDATE conversations
  SET updated_at = now()
  WHERE id = create_message.conversation_id;

  RETURN QUERY
  SELECT * FROM enriched_messages
  WHERE id = _new_message_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
