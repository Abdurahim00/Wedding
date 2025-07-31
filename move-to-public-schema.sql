-- Move all tables from wedding schema to public schema
ALTER TABLE wedding."Booking" SET SCHEMA public;
ALTER TABLE wedding."DatePrice" SET SCHEMA public;
ALTER TABLE wedding."VenueSettings" SET SCHEMA public;
ALTER TABLE wedding."PricingRule" SET SCHEMA public;
ALTER TABLE wedding."Payment" SET SCHEMA public;
ALTER TABLE wedding."Admin" SET SCHEMA public;

-- Drop the wedding schema if no longer needed
-- DROP SCHEMA wedding;