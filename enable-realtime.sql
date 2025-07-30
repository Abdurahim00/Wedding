-- Enable realtime for the wedding schema tables
-- Run this in your Supabase SQL Editor

-- First, ensure the tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'wedding';

-- Enable realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE wedding."DatePrice";
ALTER PUBLICATION supabase_realtime ADD TABLE wedding."Booking";
ALTER PUBLICATION supabase_realtime ADD TABLE wedding."Admin";
ALTER PUBLICATION supabase_realtime ADD TABLE wedding."VenueSettings";

-- Verify realtime is enabled
SELECT 
  schemaname,
  tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';