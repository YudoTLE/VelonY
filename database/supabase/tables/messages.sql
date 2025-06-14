CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  sender_id       UUID, -- REFERENCES users(id) ON DELETE SET NULL
  agent_id        UUID, -- REFERENCES users(id) ON DELETE SET NULL
  model_id        UUID, -- REFERENCES models(id) ON DELETE SET NULL
  conversation_id UUID NOT NULL, -- REFERENCES conversations(id) ON DELETE CASCADE
  
  type            VARCHAR(16) NOT NULL,
  content         TEXT NOT NULL,
  extra           TEXT NOT NULL DEFAULT '',
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;