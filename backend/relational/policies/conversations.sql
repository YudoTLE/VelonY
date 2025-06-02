CREATE POLICY "Allow SELECT for authenticated"
ON conversations
FOR SELECT
TO authenticated
USING (
  creator_id = auth.uid()
  OR
  EXISTS (
    SELECT 1
    FROM conversation_participants cp
    WHERE cp.user_id = auth.uid()
  )
);

CREATE POLICY "Allow UPDATE for authenticated"
ON conversations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants cp
    WHERE cp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM conversation_participants cp
    WHERE cp.user_id = auth.uid()
  )
);

CREATE POLICY "Allow INSERT for authenticated"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Allow DELETE for authenticated"
ON conversations
FOR DELETE
TO authenticated
USING (creator_id = auth.uid());