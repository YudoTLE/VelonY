CREATE POLICY "Allow SELECT for authenticated"
ON conversation_participants
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow UPDATE for authenticated"
ON conversation_participants
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow INSERT for authenticated"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow DELETE for authenticated"
ON conversation_participants
FOR DELETE
TO authenticated
USING (true);