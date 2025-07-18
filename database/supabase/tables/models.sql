CREATE TABLE models (
  id					 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  creator_id   UUID NOT NULL, -- REFERENCES users(id) ON DELETE CASCADE
  
  visibility   VARCHAR(16) NOT NULL DEFAULT 'private',
  name         VARCHAR(64) NOT NULL,
  description  TEXT NOT NULL,
  show_details BOOLEAN NOT NULL DEFAULT FALSE,
  llm          VARCHAR(64) NOT NULL,
  endpoint     TEXT NOT NULL,
  api_key      TEXT NOT NULL,
  config       JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE models ENABLE ROW LEVEL SECURITY;