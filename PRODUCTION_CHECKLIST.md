# Production Deployment Checklist

## Pre-Deployment (Tonight)

### 1. Environment Setup
- [x] Install all dependencies (`npm install`)
- [x] Set up Prisma schema
- [x] Configure email service (Resend)
- [x] Create environment variable template

### 2. Code Preparation
- [x] Database models ready (BookingModel, PaymentModel)
- [x] Async store operations implemented
- [x] Email templates created
- [x] Error handling in place

## Deployment Day (Tomorrow)

### 1. Supabase Setup (5 minutes)
1. [ ] Log into Supabase Pro account
2. [ ] Create new project
3. [ ] Go to Settings > Database
4. [ ] Copy the connection string
5. [ ] Update `.env.production.local` with:
   ```
   DATABASE_URL="your-supabase-connection-string"
   ```

### 2. Database Migration (2 minutes)
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to Supabase
npx prisma db push
```

### 3. Stripe Configuration (5 minutes)
1. [ ] Switch to **LIVE** mode in Stripe Dashboard
2. [ ] Copy live API keys (starts with `pk_live_` and `sk_live_`)
3. [ ] Create webhook endpoint:
   - URL: `https://your-domain.com/api/stripe-webhook`
   - Events: `payment_intent.succeeded`
4. [ ] Copy webhook signing secret
5. [ ] Update `.env.production.local`

### 4. Email Setup - Resend (3 minutes)
1. [ ] Sign up at https://resend.com (free tier: 3000 emails/month)
2. [ ] Verify your domain
3. [ ] Get API key
4. [ ] Update `.env.production.local`:
   ```
   RESEND_API_KEY="re_..."
   EMAIL_FROM="noreply@your-domain.com"
   ```

### 5. Vercel Deployment (5 minutes)
1. [ ] Install Vercel CLI: `npm i -g vercel`
2. [ ] Run `vercel` and follow prompts
3. [ ] Add environment variables in Vercel dashboard:
   - DATABASE_URL
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - RESEND_API_KEY
   - EMAIL_FROM
   - NEXT_PUBLIC_APP_URL

### 6. Deploy Command
```bash
vercel --prod
```

### 7. Post-Deployment Verification (5 minutes)
1. [ ] Test booking a date
2. [ ] Verify Stripe payment goes through
3. [ ] Check email is received
4. [ ] Verify booking appears in admin dashboard
5. [ ] Test date becomes unavailable after booking

## Total Time: ~25 minutes

## Environment Variables Summary

```env
# Production values to set
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@your-domain.com"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## Troubleshooting

### If emails aren't sending:
- Check Resend dashboard for errors
- Verify domain is properly configured
- Check API key is correct

### If payments aren't updating bookings:
- Check Stripe webhook is receiving events
- Verify webhook secret is correct
- Check browser console for errors

### If database errors occur:
- Run `npx prisma generate` again
- Check DATABASE_URL is correct
- Verify Supabase project is running

## Support Contacts
- Supabase: support@supabase.io
- Stripe: dashboard.stripe.com/support
- Resend: support@resend.com
- Vercel: vercel.com/support