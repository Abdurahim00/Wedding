# Enable Real-time Updates in Supabase

To complete the real-time setup, you need to enable replication for your tables in Supabase:

## Option 1: Using SQL Editor (Recommended)

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/eijqprtljludapmpxbgh
2. Navigate to **SQL Editor**
3. Copy and paste the following SQL:

```sql
-- Enable realtime for the wedding schema tables
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
```

4. Click **Run**

## Option 2: Using the Replication Settings

1. Go to your Supabase dashboard
2. Navigate to **Database → Replication**
3. Find the **wedding** schema section
4. Toggle ON replication for these tables:
   - DatePrice
   - Booking
   - Admin
   - VenueSettings

## Testing Real-time Updates

Once enabled, test that real-time updates are working:

1. Open your website in two browser windows
2. In one window, open the admin panel
3. In the other, open the customer booking page
4. Change a date's price or availability in the admin panel
5. The customer page should update immediately without refresh!

The real-time updates will show:
- Price changes instantly
- Availability changes instantly
- Booked dates become unavailable immediately
- All without any page refresh needed