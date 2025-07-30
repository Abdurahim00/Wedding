-- Simplified migration script (tables already exist and realtime is enabled)
-- Run this in your Supabase SQL Editor

-- Just verify the current state
SELECT 
    schemaname,
    tablename 
FROM pg_tables 
WHERE tablename IN ('Admin', 'DatePrice', 'Booking', 'Payment', 'VenueSettings', 'PricingRule')
ORDER BY schemaname, tablename;