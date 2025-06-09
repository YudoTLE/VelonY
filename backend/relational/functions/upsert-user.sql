CREATE OR REPLACE FUNCTION upsert_user(
  user_id UUID
)
RETURNS SETOF enriched_users AS $$
BEGIN
  INSERT INTO users (id)
  VALUES (upsert_user.user_id)
  ON CONFLICT (id)
  DO UPDATE SET updated_at = now();

  RETURN QUERY
  SELECT * FROM enriched_users
  WHERE id = upsert_user.user_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;