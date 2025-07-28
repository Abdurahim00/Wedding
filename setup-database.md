# Database Setup Instructions

## For Local Development

1. Install PostgreSQL locally or use a cloud service like Supabase, Neon, or Railway

2. Update the DATABASE_URL in `.env.local`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/wedding_booking?schema=public"
```

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Create and migrate the database:
```bash
npx prisma migrate dev --name init
```

## For Production

### Option 1: Vercel + Vercel Postgres
1. Deploy to Vercel
2. Add Vercel Postgres from the dashboard
3. It will automatically set DATABASE_URL

### Option 2: Supabase (Free tier available)
1. Create account at https://supabase.com
2. Create new project
3. Go to Settings > Database
4. Copy connection string and add to Vercel environment variables

### Option 3: Railway
1. Create account at https://railway.app
2. Create PostgreSQL database
3. Copy connection URL and add to environment variables

### Option 4: Neon (Free tier available)
1. Create account at https://neon.tech
2. Create database
3. Copy connection string

## Deploy Steps

1. Set environment variables in your hosting platform:
   - DATABASE_URL
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET (get from Stripe dashboard)

2. Build command:
```bash
npx prisma generate && npm run build
```

3. After deployment, run migrations:
```bash
npx prisma migrate deploy
```

## Setting up Stripe Webhook for Production

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe-webhook`
3. Select events: `payment_intent.succeeded`
4. Copy the signing secret and add as STRIPE_WEBHOOK_SECRET

## Initial Admin Setup

After database is created, you can optionally seed an admin user or use the hardcoded credentials (admin/admin123) for the first login.