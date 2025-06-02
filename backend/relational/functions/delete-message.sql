CREATE OR REPLACE FUNCTION delete_message(
  message_id UUID
)
RETURNS SETOF enriched_messages AS $$
DECLARE
  _deleted_message enriched_messages%ROWTYPE;
BEGIN
  SELECT m.*
  INTO STRICT _deleted_message
  FROM enriched_messages m
  WHERE m.id = delete_message.message_id;

  DELETE FROM messages
  WHERE id = delete_message.message_id;

  UPDATE conversations
  SET updated_at = now()
  WHERE id = _deleted_message.conversation_id;

  UPDATE users
  SET updated_at = now()
  WHERE id = _deleted_message.sender_id;

  RETURN NEXT _deleted_message;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;