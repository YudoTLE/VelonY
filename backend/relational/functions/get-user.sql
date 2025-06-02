CREATE OR REPLACE FUNCTION get_user(
  user_id UUID
)
RETURNS SETOF enriched_users AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM enriched_users
  WHERE id = get_user.user_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;