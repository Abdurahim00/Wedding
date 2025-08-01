import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Check if environment variables are loaded
  const hasStripeKey = !!process.env.STRIPE_SECRET_KEY
  const hasPublicKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  
  // Safely check key format without exposing the full key
  const keyInfo = process.env.STRIPE_SECRET_KEY ? {
    starts_with: process.env.STRIPE_SECRET_KEY.substring(0, 7),
    length: process.env.STRIPE_SECRET_KEY.length,
    includes_test: process.env.STRIPE_SECRET_KEY.includes('test'),
    trimmed_length: process.env.STRIPE_SECRET_KEY.trim().length,
    // Check for asterisks which indicate masking
    contains_asterisks: process.env.STRIPE_SECRET_KEY.includes('*'),
    asterisk_count: (process.env.STRIPE_SECRET_KEY.match(/\*/g) || []).length,
    // Get first 20 and last 4 chars to see the pattern
    first_20: process.env.STRIPE_SECRET_KEY.substring(0, 20),
    last_4: process.env.STRIPE_SECRET_KEY.substring(process.env.STRIPE_SECRET_KEY.length - 4)
  } : null

  return NextResponse.json({
    hasStripeSecretKey: hasStripeKey,
    hasStripePublicKey: hasPublicKey,
    secretKeyInfo: keyInfo,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    timestamp: new Date().toISOString()
  })
}