CREATE TABLE agents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
  creator_id    UUID NOT NULL, -- REFERENCES users(id) ON DELETE CASCADE
  
  visibility    VARCHAR(20) NOT NULL DEFAULT 'private',
  name          VARCHAR(100) NOT NULL,
  description   TEXT NOT NULL,
  system_prompt TEXT NOT NULL,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;