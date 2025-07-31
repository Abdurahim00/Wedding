# Wedding Booking System

A comprehensive wedding venue booking system built with Next.js, Supabase, and Stripe.

## Recent Fixes (Latest Update)

### Video Upload Issues
- **Problem**: Supabase storage bucket 'videos' was missing, causing upload failures
- **Solution**: Added automatic bucket creation with proper configuration
- **Files Modified**: `src/lib/supabase-storage.ts`

### Performance Issues
- **Problem**: Calendar data API was making individual queries for each date, causing slow response times
- **Solution**: Optimized to use batch queries and lookup maps for better performance
- **Files Modified**: `app/api/calendar-data/route.ts`

### Node.js Version Warning
- **Problem**: Supabase warning about Node.js 18 deprecation
- **Solution**: Added Node.js 20+ requirement to package.json
- **Files Modified**: `package.json`

### Experimental Warning
- **Problem**: Node.js experimental buffer.File warning during file uploads
- **Note**: This warning is harmless and expected in Node.js 18. It doesn't affect functionality.

## Quick Fix Summary

1. **Video Uploads**: The system will now automatically create the required Supabase storage bucket
2. **Calendar Performance**: Calendar data loading should be significantly faster
3. **Node.js**: Consider upgrading to Node.js 20+ for best compatibility

## Troubleshooting

If you encounter upload issues:
1. Ensure your Supabase project has storage enabled
2. Check that your environment variables are correctly set
3. The system will automatically create the 'videos' bucket if it doesn't exist

# Wedding booking dashboard

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/josefs-projects-60548e63/v0-wedding-booking-dashboard)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/tYw3m5nE5Nm)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/josefs-projects-60548e63/v0-wedding-booking-dashboard](https://vercel.com/josefs-projects-60548e63/v0-wedding-booking-dashboard)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/tYw3m5nE5Nm](https://v0.dev/chat/projects/tYw3m5nE5Nm)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository