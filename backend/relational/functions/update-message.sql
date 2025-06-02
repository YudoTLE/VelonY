CREATE OR REPLACE FUNCTION update_message(
  message_id      UUID,
  type            VARCHAR(10) DEFAULT NULL,
  content         TEXT DEFAULT NULL,
  extra           TEXT DEFAULT NULL,
  agent_id        UUID DEFAULT NULL,
  model_id        UUID DEFAULT NULL
)
RETURNS SETOF enriched_messages AS $$
DECLARE
  _new_message enriched_messages%ROWTYPE;
BEGIN
  UPDATE messages
  SET
    type     = COALESCE(update_message.type, messages.type),
    content  = COALESCE(update_message.content, messages.content),
    extra    = COALESCE(update_message.extra, messages.extra),
    agent_id = COALESCE(update_message.agent_id, messages.agent_id),
    model_id = COALESCE(update_message.model_id, messages.model_id)
  WHERE id = update_message.message_id;

  SELECT *
  INTO _new_message
  FROM enriched_messages
  WHERE id = message_id;
  
  UPDATE users
  SET updated_at = now()
  WHERE id = _new_message.sender_id;

  UPDATE conversations
  SET updated_at = now()
  WHERE id = _new_message.conversation_id;

  RETURN NEXT _new_message;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;