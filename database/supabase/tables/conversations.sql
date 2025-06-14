CREATE TABLE conversations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  creator_id UUID, -- REFERENCES users(id) ON DELETE SET NULL

  title      TEXT NOT NULL DEFAULT '',
  type       VARCHAR(16) NOT NULL DEFAULT 'default',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;