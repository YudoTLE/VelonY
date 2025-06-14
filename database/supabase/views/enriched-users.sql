CREATE OR REPLACE VIEW enriched_users 
WITH (security_invoker = true) AS
SELECT
  u.*,
  au.email,
  au.raw_user_meta_data ->> 'name' AS name,
  au.raw_user_meta_data ->> 'avatar_url' AS avatar
FROM users u
JOIN auth.users au ON u.id = au.id;