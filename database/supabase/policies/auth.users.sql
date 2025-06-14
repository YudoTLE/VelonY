CREATE POLICY "Allow SELECT on auth.users for authenticated"
ON auth.users
FOR SELECT
TO authenticated
USING (true);