# Stripe Setup Instructions

## 1. Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Start now" or "Sign up"
3. Create your account

## 2. Get Your Test API Keys

1. Log into your Stripe Dashboard
2. Make sure you're in **Test mode** (toggle in the top right)
3. Go to [Developers > API keys](https://dashboard.stripe.com/test/apikeys)
4. Copy your keys:
   - **Publishable key**: starts with `pk_test_`
   - **Secret key**: starts with `sk_test_`

## 3. Update Environment Variables

Edit the `.env.local` file and replace the placeholder values:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
```

## 4. Test Card Numbers

Use these test card numbers for testing payments:

- **Success**: 4242 4242 4242 4242
- **Requires authentication**: 4000 0025 0000 3155
- **Declined**: 4000 0000 0000 9995

For all test cards:
- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC
- Use any 5-digit postal code

## 5. Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit the website at http://localhost:3000

3. Select a date from the calendar

4. Fill out the booking form

5. In the payment modal, use test card: 4242 4242 4242 4242

6. Complete the payment

7. Check the console for the email confirmation

8. Visit `/admin` (password: admin123) to see the booking

## 6. Production Setup

When ready for production:

1. Switch to Live mode in Stripe Dashboard
2. Get your live API keys
3. Update your production environment variables
4. Ensure your domain is added to Stripe's allowed domains
5. Set up webhooks for payment confirmations
6. Configure email service (SendGrid, AWS SES, etc.)

## Features Implemented

- ✅ Full Stripe payment integration
- ✅ Date-based pricing (admin can set prices per date)
- ✅ Default price of 1 SEK
- ✅ Secure payment processing
- ✅ Email confirmations (logged to console)
- ✅ Real-time booking updates in admin dashboard
- ✅ Professional payment UI with Stripe Elements

## Troubleshooting

- **"Invalid API Key"**: Make sure you copied the full key including the prefix
- **Payment fails**: Check that you're using test mode keys with test cards
- **CORS errors**: Ensure you're running on http://localhost:3000