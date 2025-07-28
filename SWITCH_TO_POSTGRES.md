# Quick Switch from SQLite to PostgreSQL

When you get your Supabase connection tomorrow, just do these 3 steps:

## 1. Update Prisma Schema
Change line 6 in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // <-- Change from "sqlite" to "postgresql"
  url      = env("DATABASE_URL")
}
```

## 2. Update DATABASE_URL
In `.env` and `.env.production.local`:
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

## 3. Push to Supabase
```bash
npx prisma db push
```

That's it! Everything else stays the same.