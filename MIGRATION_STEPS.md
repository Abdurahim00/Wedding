# Migration Steps: Wedding Schema to Public Schema

Follow these steps in order to complete the migration:

## Step 1: Run the Migration SQL
1. Go to your Supabase SQL Editor: https://app.supabase.com/project/eijqprtljludapmpxbgh/sql
2. Copy all the content from `migrate-to-public-schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the migration
5. You should see a success message and a table showing all tables now in the 'public' schema

## Step 2: Generate Prisma Client
Run these commands in your terminal:

```bash
# Generate the new Prisma client with public schema
npx prisma generate

# Push the schema to ensure consistency
npx prisma db push
```

## Step 3: Restart Your Development Server
```bash
# Stop the server (Ctrl+C) then restart
npm run dev
```

## Step 4: Verify Everything Works
1. Open your browser to http://localhost:3000
2. Check that:
   - ✅ No more 406 errors in the console
   - ✅ Calendar loads correctly
   - ✅ Date prices are displayed
   - ✅ You can click on dates to see booking modal
   - ✅ Real-time updates work (open two browser tabs and make changes in one)

## Step 5: Test Admin Functions
1. Go to http://localhost:3000/admin
2. Test:
   - Setting date prices
   - Viewing bookings
   - Making changes and seeing them update in real-time

## Troubleshooting

If you get errors after migration:

1. **"Table not found" errors**: The migration might have failed. Check the SQL editor for error messages.

2. **Prisma errors**: Run `npx prisma generate` again

3. **Still getting 406 errors**: Clear your browser cache and hard refresh (Ctrl+Shift+R)

4. **Real-time not working**: 
   - Check that the tables were added to the realtime publication in the SQL script
   - Go to Supabase Dashboard > Database > Replication and verify DatePrice and Booking are enabled

## Success!
Once everything is working:
- 🎉 Your app now uses the public schema
- 🚀 Real-time updates work automatically
- ✅ No more schema configuration needed

## Optional: Clean Up
After verifying everything works, you can drop the empty wedding schema:
```sql
DROP SCHEMA wedding CASCADE;
```