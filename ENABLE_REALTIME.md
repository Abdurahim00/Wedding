# Enable Supabase Realtime (FREE)

You already have Supabase, so real-time updates are FREE! Here's how to enable them:

## 1. Get Your Anon Key

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project (`eijqprtljludapmpxbgh`)
3. Go to **Settings** → **API**
4. Copy the `anon public` key
5. Add to `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY="paste-your-key-here"
   ```

## 2. Enable Realtime on Tables

In Supabase SQL Editor, run:

```sql
-- Enable realtime for the wedding schema tables
ALTER PUBLICATION supabase_realtime ADD TABLE wedding."DatePrice";
ALTER PUBLICATION supabase_realtime ADD TABLE wedding."Booking";
```

Or via Dashboard:
1. Go to **Database** → **Replication**
2. Under "Source", find your tables:
   - `wedding.DatePrice`
   - `wedding.Booking`
3. Toggle them ON

## 3. Update Your Code

Replace `useCalendarData` with `useSupabaseRealtime`:

```typescript
// Before:
import { useCalendarData } from '@/src/hooks/useCalendarData'
const { isDateAvailable, getDatePrice } = useCalendarData(days)

// After:
import { useSupabaseRealtime } from '@/src/hooks/useSupabaseRealtime'
const { isDateAvailable, getDatePrice } = useSupabaseRealtime(days)
```

## That's It! 

Updates will now be:
- **Instant** (< 100ms)
- **FREE** (included with Supabase)
- **Automatic** (no polling needed)

## How It Works:

1. Admin changes date availability
2. Supabase detects the database change
3. Sends update via WebSocket to all browsers
4. Calendar updates instantly!

No more polling, no more delays, completely FREE!