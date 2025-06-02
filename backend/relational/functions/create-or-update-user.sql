CREATE OR REPLACE FUNCTION create_or_update_user(
  user_id UUID
)
RETURNS SETOF enriched_users AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE id = user_id) THEN
    UPDATE users
    SET updated_at = now()
    WHERE id = user_id;
  ELSE
    INSERT INTO users (id)
    VALUES (user_id);
  END IF;

  RETURN QUERY
  SELECT * FROM enriched_users
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;