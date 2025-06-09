CREATE POLICY "Allow SELECT for authenticated"
ON model_subscriptions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM models
    WHERE models.id = model_subscriptions.model_id
      AND (models.visibility = 'default' OR models.creator_id = auth.uid())
  )
);

CREATE POLICY "Allow UPDATE for authenticated"
ON model_subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow INSERT for authenticated"
ON model_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 
    FROM models 
    WHERE models.id = model_subscriptions.model_id
      AND models.visibility = 'public'
      AND models.creator_id != auth.uid()
  )
);

CREATE POLICY "Allow DELETE for authenticated"
ON model_subscriptions
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM models
    WHERE models.id = model_subscriptions.model_id
      AND models.creator_id = auth.uid()
  )
);