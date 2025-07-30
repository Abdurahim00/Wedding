# Supabase Migration Guide - Wedding Booking System

## Prerequisites
1. Create a Supabase account and project at https://supabase.com
2. Get your database credentials from the Supabase dashboard

## Steps to Complete Migration

### 1. Update Environment Variables
You need to add your database password to `.env.local`:
- Replace `[YOUR-PASSWORD]` with your database password from Supabase Settings > Database

### 2. Create the Wedding Schema
Since this project shares a Supabase instance with your restaurant project, we use a separate schema.

**IMPORTANT**: Run the SQL commands in `create-wedding-schema.sql` in your Supabase SQL Editor to create the wedding schema without affecting existing tables.

### 3. Install Dependencies
```bash
npm install @prisma/client prisma
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Push Schema to Supabase
```bash
npx prisma db push
```

### 6. (Optional) Migrate Existing Data
If you have existing data in SQLite that needs to be migrated, you can:
1. Export data from SQLite
2. Import to Supabase using the Supabase dashboard or SQL commands

### 7. Test the Application
```bash
npm run dev
```

## Important Notes
- All wedding booking tables are isolated in the `wedding` schema to keep them separate from your restaurant tables
- The schema has been updated to use PostgreSQL-specific features like `@db.Timestamptz(6)` for better timezone handling
- Text fields use `@db.Text` for unlimited length
- Make sure to keep your database credentials secure and never commit them to version control
- The service role key should be kept server-side only and never exposed to the client