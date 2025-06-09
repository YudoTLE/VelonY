CREATE OR REPLACE FUNCTION upsert_conversation_participant(
  user_id         UUID,
  conversation_id UUID,
  role            VARCHAR(10) DEFAULT NULL
)
RETURNS conversation_participants AS $$
DECLARE
  _upserted_conversation conversation_participants%ROWTYPE;
BEGIN
  INSERT INTO conversation_participants (user_id, conversation_id, role)
  VALUES (
    upsert_conversation_participant.user_id, 
    upsert_conversation_participant.conversation_id, 
    COALESCE(upsert_conversation_participant.role, 'member')
  )
  ON CONFLICT (user_id, conversation_id)
  DO UPDATE SET
    role       = COALESCE(upsert_conversation_participant.role, conversation_participants.role),
    updated_at = now()
  RETURNING * INTO _upserted_conversation;

  RETURN _upserted_conversation;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;