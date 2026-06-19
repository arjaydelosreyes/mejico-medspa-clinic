-- Revoke DELETE from anon — unauthenticated users must never delete rows
REVOKE DELETE ON ALL TABLES IN SCHEMA public FROM anon;
