CREATE POLICY "Allow SELECT for authenticated"
ON agent_subscriptions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM agents
    WHERE agents.id = agent_subscriptions.agent_id
      AND (agents.visibility = 'default' OR agents.creator_id = auth.uid())
  )
);

CREATE POLICY "Allow UPDATE for authenticated"
ON agent_subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow INSERT for authenticated"
ON agent_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 
    FROM agents 
    WHERE agents.id = agent_subscriptions.agent_id
      AND agents.visibility = 'public'
      AND agents.creator_id != auth.uid()
  )
);

CREATE POLICY "Allow DELETE for authenticated"
ON agent_subscriptions
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM agents
    WHERE agents.id = agent_subscriptions.agent_id
      AND agents.creator_id = auth.uid()
  )
);