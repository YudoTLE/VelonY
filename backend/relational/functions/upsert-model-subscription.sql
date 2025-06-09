CREATE OR REPLACE FUNCTION upsert_model_subscription(
  user_id UUID,
  model_id UUID
)
RETURNS model_subscriptions AS $$
DECLARE
  _upserted_model model_subscriptions%ROWTYPE;
BEGIN
  INSERT INTO model_subscriptions (user_id, model_id)
  VALUES (
    upsert_model_subscription.user_id,
    upsert_model_subscription.model_id
  )
  ON CONFLICT (user_id, model_id)
  DO UPDATE SET updated_at = now()
  RETURNING * INTO _upserted_model;

  RETURN _upserted_model;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;