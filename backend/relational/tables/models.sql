CREATE TABLE models (
  id					 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  creator_id   UUID NOT NULL, -- REFERENCES users(id) ON DELETE CASCADE
  
  visibility   VARCHAR(20) NOT NULL DEFAULT 'private',
  name         VARCHAR(100) NOT NULL,
  description  TEXT NOT NULL,
  llm_model    VARCHAR(100) NOT NULL,
  endpoint_url TEXT NOT NULL,
  api_key      TEXT NOT NULL,
  preset       VARCHAR(50) NOT NULL DEFAULT 'Other',
  config       JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE models ENABLE ROW LEVEL SECURITY;