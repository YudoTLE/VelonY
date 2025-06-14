CREATE TABLE model_subscriptions (
  user_id    UUID NOT NULL, -- REFERENCES users(id) ON DELETE CASCADE
  model_id   UUID NOT NULL, -- REFERENCES model(id) ON DELETE CASCADE

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, model_id)
);

ALTER TABLE model_subscriptions ENABLE ROW LEVEL SECURITY;