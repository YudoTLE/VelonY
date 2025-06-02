GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
-- Grant usage on the auth schema
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Grant SELECT on auth.users specifically
GRANT SELECT ON auth.users TO authenticated;



REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM authenticated;
