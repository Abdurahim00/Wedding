# Wedding Booking System - Setup Instructions

## ✅ Completed Setup

The application is now fully functional with the following features implemented:

1. **Database Models** - All models are using Prisma with the `wedding` schema
2. **Admin Authentication** - JWT-based authentication system (default: admin/admin123)
3. **Date Pricing Management** - Admins can set custom prices for specific dates
4. **Video Upload & Management** - Admins can upload and manage the homepage video
5. **Booking Availability Logic** - Proper date availability checking
6. **Stripe Payment Integration** - Full payment flow with webhooks
7. **Email Confirmation System** - Booking confirmations via email

## 🚀 Required Environment Variables

You need to add the following to your `.env` file:

```env
# Stripe Configuration (REQUIRED)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key"
STRIPE_SECRET_KEY="sk_test_your_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"  # Optional for local dev

# JWT Secret for Admin Auth (REQUIRED)
JWT_SECRET="your-secret-key-here"  # Generate a random string

# Email Configuration (OPTIONAL - logs to console if not set)
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="Your Venue <noreply@yourdomain.com>"
```

## 📋 Setup Steps

### 1. Configure Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your test API keys
3. Add them to `.env`
4. (Optional) Set up webhook endpoint for production

### 2. Configure JWT Secret
Generate a secure random string:
```bash
openssl rand -base64 32
```

### 3. Configure Email (Optional)
1. Sign up at [Resend](https://resend.com)
2. Get your API key
3. Add to `.env`
4. Verify your sending domain

### 4. Create Uploads Directory
```bash
mkdir -p public/uploads/videos
```

### 5. Run the Application
```bash
npm run dev
```

## 🔐 Admin Access

- URL: `/admin`
- Default credentials: `admin` / `admin123`
- First login will create the admin user automatically

## 📱 Features Overview

### Customer Features
- Browse available dates with dynamic pricing
- Make bookings with guest details
- Secure payment via Stripe
- Receive email confirmation
- View venue video on homepage

### Admin Features
- View all bookings and statistics
- Set custom prices for specific dates
- Upload and manage venue video
- View financial analytics
- Manage booking statuses

## 🧪 Testing the Flow

1. **Set Date Prices** (Admin)
   - Login to admin panel
   - Go to Pricing tab
   - Set prices for specific dates

2. **Upload Video** (Admin)
   - Go to Video tab
   - Upload an MP4/WebM video
   - Video will appear on homepage

3. **Make a Booking** (Customer)
   - Go to homepage
   - Select a date
   - Fill booking details
   - Complete payment with test card: `4242 4242 4242 4242`

4. **Check Confirmation**
   - Check console logs for email (if Resend not configured)
   - Check admin panel for new booking
   - Booking status should be "confirmed"

## 🐛 Troubleshooting

### Database Issues
- Ensure tables are in `wedding` schema in Supabase
- Run `npx prisma db push` if tables are missing

### Payment Issues
- Verify Stripe keys are correct
- Check browser console for errors
- Ensure price is at least 3 SEK (Stripe minimum)

### Email Issues
- Emails log to console if Resend not configured
- Check Resend dashboard for delivery status
- Verify sender domain is verified

### Video Upload Issues
- Check file size < 100MB
- Ensure format is MP4/WebM/OGG
- Check `public/uploads/videos` directory exists

## 📞 Support

For any issues:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify all environment variables are set
4. Ensure database connection is working