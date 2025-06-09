CREATE POLICY "Allow SELECT for authenticated"
ON conversation_participants
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow UPDATE for authenticated"
ON conversation_participants
FOR UPDATE
TO authenticated
USING (
  -- Users can always update themselves (notification settings, etc.)
  user_id = auth.uid()
  OR (
    -- For non-global: admins can update members
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = conversation_participants.conversation_id 
        AND conversations.type != 'global'
    )
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
        AND cp.user_id = auth.uid()
        AND cp.role = 'admin'
    )
    AND role = 'member'
  )
  OR (
    -- Creators can always update anyone
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_participants.conversation_id
        AND conversations.creator_id = auth.uid()
    )
  )
)
WITH CHECK (
  -- Users can update themselves
  user_id = auth.uid()
  OR (
    -- For non-global: admins can promote members
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = conversation_participants.conversation_id 
        AND conversations.type != 'global'
    )
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
        AND cp.user_id = auth.uid()
        AND cp.role = 'admin'
    )
    AND role IN ('member', 'admin')
  )
  OR (
    -- Creators can always update anyone
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_participants.conversation_id
        AND conversations.creator_id = auth.uid()
    )
  )
);

CREATE POLICY "Allow INSERT for authenticated"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow DELETE for authenticated"
ON conversation_participants
FOR DELETE
TO authenticated
USING (
  -- Can't delete from global conversations
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = conversation_participants.conversation_id 
      AND conversations.type != 'global'
  )
  AND (
    -- Users can leave themselves
    user_id = auth.uid()
    OR (
      -- Admins can kick members (but not other admins)
      EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = conversation_participants.conversation_id
          AND cp.user_id = auth.uid()
          AND cp.role = 'admin'
      )
      AND role = 'member'
    )
    OR (
      -- Creators can kick anyone
      EXISTS (
        SELECT 1 FROM conversations
        WHERE conversations.id = conversation_participants.conversation_id
          AND conversations.creator_id = auth.uid()
      )
    )
  )
);