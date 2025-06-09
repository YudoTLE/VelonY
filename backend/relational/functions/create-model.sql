CREATE OR REPLACE FUNCTION create_model(
  creator_id   UUID,
  name         VARCHAR(100),
  llm_model    VARCHAR(100),
  endpoint_url TEXT,
  api_key      TEXT,
  preset       VARCHAR(50),
  config       JSONB
)
RETURNS SETOF enriched_models AS $$
DECLARE
  _model_id UUID;
BEGIN
  INSERT INTO models (creator_id, name, llm_model, endpoint_url, api_key, preset, config)
  VALUES (
    create_model.creator_id,
    create_model.name,
    create_model.llm_model,
    create_model.endpoint_url,
    create_model.api_key,
    create_model.preset,
    create_model.config
  )
  RETURNING id INTO _model_id;

  UPDATE users
  SET updated_at = now()
  WHERE id = create_model.creator_id;

  RETURN QUERY
  SELECT * FROM enriched_models WHERE id = _model_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
