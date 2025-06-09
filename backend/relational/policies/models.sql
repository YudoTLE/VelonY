CREATE POLICY "Allow SELECT for authenticated"
ON models
FOR SELECT
TO authenticated
USING (
  visibility != 'private'
  OR creator_id = auth.uid()
);

CREATE POLICY "Allow UPDATE for authenticated"
ON models
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
ON models
FOR INSERT
TO authenticated
WITH CHECK (
  creator_id = auth.uid()
  AND visibility != 'default'
);

CREATE POLICY "Allow DELETE for authenticated"
ON models
FOR DELETE
TO authenticated
USING (
  creator_id = auth.uid()
  AND visibility != 'default'
);