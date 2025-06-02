CREATE OR REPLACE FUNCTION delete_conversation(
  conversation_id UUID
)
RETURNS SETOF enriched_conversations AS $$
DECLARE
  _deleted_conversation enriched_conversations%ROWTYPE;
BEGIN
  SELECT c.*
  INTO STRICT _deleted_conversation
  FROM enriched_conversations c
  WHERE c.id = delete_conversation.conversation_id;

  DELETE FROM conversations
  WHERE id = delete_conversation.conversation_id;

  UPDATE users
  SET updated_at = now()
  WHERE id = _deleted_conversation.creator_id;

  RETURN NEXT _deleted_conversation;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;