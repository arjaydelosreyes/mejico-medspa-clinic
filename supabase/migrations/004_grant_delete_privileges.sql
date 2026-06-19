-- Grant DELETE on all tables to authenticated role (was missing from 002)
GRANT DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT DELETE ON ALL TABLES IN SCHEMA public TO anon;
