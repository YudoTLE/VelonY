CREATE OR REPLACE FUNCTION create_model(
  creator_id   UUID,
  name         TEXT,
  llm_model    TEXT,
  endpoint_url TEXT,
  api_key      TEXT
)
RETURNS SETOF enriched_models AS $$
DECLARE
  _model_id UUID;
BEGIN
  INSERT INTO models (creator_id, name, llm_model, endpoint_url, api_key)
  VALUES (create_model.creator_id, create_model.name, create_model.llm_model, create_model.endpoint_url, create_model.api_key)
  RETURNING id INTO _model_id;

  UPDATE users
  SET updated_at = now()
  WHERE id = create_model.creator_id;

  RETURN QUERY
  SELECT * FROM enriched_models WHERE id = _model_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
