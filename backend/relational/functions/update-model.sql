CREATE OR REPLACE FUNCTION update_model(
  model_id     UUID,
  visibility   VARCHAR(20),
  name         VARCHAR(100),
  llm_model    VARCHAR(100),
  endpoint_url TEXT,
  api_key      TEXT
)
RETURNS SETOF enriched_models AS $$
BEGIN
  UPDATE models
  SET
    visibility   = COALESCE(update_model.visibility, models.visibility),
    name         = COALESCE(update_model.name, models.name),
    llm_model    = COALESCE(update_model.llm_model, models.llm_model),
    endpoint_url = COALESCE(update_model.endpoint_url, models.endpoint_url),
    api_key      = COALESCE(update_model.api_key, models.api_key),
    updated_at   = now()
  WHERE id = update_model.model_id;

  UPDATE users
  SET updated_at = now()
  WHERE id = auth.uid();

  RETURN QUERY
  SELECT * FROM enriched_models
  WHERE id = update_model.model_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;