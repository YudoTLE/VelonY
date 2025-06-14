CREATE POLICY "Allow SELECT for authenticated"
ON agents
FOR SELECT
TO authenticated
USING (
  visibility != 'private'
  OR creator_id = auth.uid()
);

CREATE POLICY "Allow UPDATE for authenticated"
ON agents
FOR UPDATE
TO authenticated
USING (
  creator_id = auth.uid()
  AND visibility != 'default'
)
WITH CHECK (
  creator_id = auth.uid()
  AND visibility != 'default'
);

CREATE POLICY "Allow INSERT for authenticated"
ON agents
FOR INSERT
TO authenticated
WITH CHECK (
  creator_id = auth.uid()
  AND visibility != 'default'
);

CREATE POLICY "Allow DELETE for authenticated"
ON agents
FOR DELETE
TO authenticated
USING (
  creator_id = auth.uid()
  AND visibility != 'default'
);