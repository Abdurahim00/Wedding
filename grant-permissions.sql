-- Grant permissions for the wedding schema to Supabase roles
-- Run this in your Supabase SQL Editor

-- Grant schema usage permissions
GRANT USAGE ON SCHEMA wedding TO anon, authenticated, service_role;

-- Grant permissions on all existing tables
GRANT ALL ON ALL TABLES IN SCHEMA wedding TO anon, authenticated, service_role;

-- Grant permissions on all routines (functions/procedures)
GRANT ALL ON ALL ROUTINES IN SCHEMA wedding TO anon, authenticated, service_role;

-- Grant permissions on all sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA wedding TO anon, authenticated, service_role;

-- Set default permissions for future objects
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA wedding GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA wedding GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA wedding GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- Verify the schema is exposed (this is just a check, not a modification)
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'wedding';