CREATE POLICY "Allow SELECT for authenticated"
ON models
FOR SELECT
TO authenticated
USING (
  visibility = 'public'
  OR
  (visibility = 'private' AND creator_id = auth.uid())
);

CREATE POLICY "Allow UPDATE for authenticated"
ON models
FOR UPDATE
TO authenticated
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Allow INSERT for authenticated"
ON models
FOR INSERT
TO authenticated
WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Allow DELETE for authenticated"
ON models
FOR DELETE
TO authenticated
USING (creator_id = auth.uid());