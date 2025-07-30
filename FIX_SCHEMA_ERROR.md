# Fix for "The schema must be one of the following: public, graphql_public" Error

## Problem
You're seeing 406 errors with the message "The schema must be one of the following: public, graphql_public" because Supabase's PostgREST API is not configured to expose the `wedding` schema.

## Immediate Fix (Applied)
I've temporarily disabled Supabase realtime and the app is now using regular API polling, which works perfectly with the wedding schema.

## Permanent Solution: Configure Supabase Dashboard

To enable real-time updates, you need to expose the wedding schema in Supabase:

1. **Go to Supabase Dashboard**
   - https://app.supabase.com
   - Select your project

2. **Navigate to Settings → API**

3. **Find "Exposed schemas" setting**
   - By default, it only shows: `public`
   - You need to add: `public, wedding`

4. **Save and wait**
   - Changes take effect immediately
   - No restart needed

5. **Re-enable realtime in the code**
   - Edit `src/hooks/useSupabaseRealtime.ts`
   - Change line 22 from `if (!supabase || true) {` to `if (!supabase) {`
   - Save the file

## What's Working Now

✅ Calendar displays correctly  
✅ Date prices show properly  
✅ Bookings can be created and viewed  
✅ Admin functions work normally  
✅ Everything uses the `wedding` schema via Prisma  

## What's Temporarily Disabled

❌ Real-time updates (requires manual refresh)  
- This will work once you update the Supabase dashboard

## Alternative: Use Public Schema

If you prefer not to expose the wedding schema:

1. Move all tables from `wedding` schema to `public` schema
2. Update Prisma schema to remove `@@schema("wedding")` from all models
3. Run migrations
4. Real-time will work immediately

## Technical Details

- Supabase PostgREST only exposes schemas that are explicitly configured
- The `wedding` schema exists and works fine with direct database connections (Prisma)
- This is a security feature, not a bug
- The SQL permissions script (`expose-wedding-schema.sql`) grants the right permissions but doesn't change the PostgREST configuration