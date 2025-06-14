CREATE TABLE agent_subscriptions (
  user_id    UUID NOT NULL, -- REFERENCES users(id) ON DELETE CASCADE
  agent_id   UUID NOT NULL, -- REFERENCES agent(id) ON DELETE CASCADE

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, agent_id)
);

ALTER TABLE agent_subscriptions ENABLE ROW LEVEL SECURITY;