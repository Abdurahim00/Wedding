-- Create wedding schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS wedding;

-- Grant permissions
GRANT ALL ON SCHEMA wedding TO postgres;
GRANT ALL ON SCHEMA wedding TO anon;
GRANT ALL ON SCHEMA wedding TO authenticated;
GRANT ALL ON SCHEMA wedding TO service_role;

-- Set search path to include wedding schema
-- Note: This only affects the current session
SET search_path TO wedding, public;