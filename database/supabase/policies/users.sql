CREATE POLICY "Allow SELECT for authenticated"
ON users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow UPDATE for authenticated"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (true);

CREATE POLICY "Allow INSERT for authenticated"
ON users
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow DELETE for authenticated"
ON users
FOR DELETE
TO authenticated
USING (id = auth.uid());