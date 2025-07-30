# Email Setup Instructions

## Current Status
The email service is integrated but needs configuration to send actual emails.

## Option 1: Use Resend (Recommended for Production)

1. **Sign up for Resend**
   - Go to https://resend.com
   - Create a free account (10,000 emails/month free)
   
2. **Get your API Key**
   - In Resend dashboard, go to API Keys
   - Create a new API key
   - Copy the key

3. **Add to your .env file**
   ```
   RESEND_API_KEY="re_xxxxxxxxxxxxx"
   EMAIL_FROM="Mazzika Fest <noreply@yourdomain.com>"
   ```

4. **Verify your domain (optional but recommended)**
   - Add your domain in Resend dashboard
   - Follow DNS verification steps
   - This allows sending from your custom domain

## Option 2: Development Mode (Current Setup)

Without RESEND_API_KEY, emails are logged to the console instead of being sent.

When you make a booking, check your terminal/console for:
```
=== EMAIL CONFIRMATION ===
To: customer@example.com
From: hello@mazzikafest.com
Subject: Booking Confirmation - Mazzika Fest
Content Preview: Booking confirmed for John Doe on 2024-01-15
========================
```

## Testing Email Functionality

1. Make a test booking through the website
2. Check your terminal console for the email log (development mode)
3. Or check your email inbox (if Resend is configured)

## Email Flow

1. User completes booking and payment
2. Booking is created in database
3. Email service is called automatically
4. Confirmation email is sent (or logged in dev mode)

## Troubleshooting

- **No email received**: Check if RESEND_API_KEY is set
- **Email in spam**: Verify your domain in Resend
- **Error in console**: Check API key is valid
- **Development mode**: Emails only log to console without API key