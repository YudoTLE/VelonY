CREATE POLICY "Allow SELECT for authenticated"
ON messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants cp
    WHERE
      cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Allow UPDATE for authenticated"
ON messages
FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Allow INSERT for authenticated"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Allow DELETE for authenticated"
ON messages
FOR DELETE
TO authenticated
USING (
  sender_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM conversation_participants cp
    WHERE
      cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
      AND cp.role = 'admin'
  )
);