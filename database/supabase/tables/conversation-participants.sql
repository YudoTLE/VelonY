CREATE TABLE conversation_participants (
  user_id         UUID NOT NULL, -- REFERENCES users(id) ON DELETE CASCADE
  conversation_id UUID NOT NULL, -- REFERENCES conversations(id) ON DELETE CASCADE

  role            VARCHAR(8) NOT NULL,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;