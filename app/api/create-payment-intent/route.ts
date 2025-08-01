import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Import Stripe inside the function to ensure proper initialization
const Stripe = require('stripe')

export async function POST(request: NextRequest) {
  try {
    // Get the key and trim any whitespace
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim()
    
    // Debug: Check if secret key exists
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY is missing in environment')
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 500 }
      )
    }
    
    // Log the key format (safely)
    console.log('Stripe key format check:', {
      exists: true,
      starts_with: stripeKey.substring(0, 7),
      length: stripeKey.length,
      trimmed: stripeKey.length
    })
    
    // Initialize Stripe with the trimmed key
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-11-20.acacia',
    })
    
    const { amount, bookingId, customerEmail, customerName } = await request.json()

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in smallest currency unit (öre for SEK)
      currency: 'sek',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId,
        customerEmail,
        customerName,
      },
      receipt_email: customerEmail,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: any) {
    console.error('Stripe error:', error)
    console.error('Error type:', error.type)
    console.error('Error code:', error.code)
    console.error('Raw error:', error.raw)
    
    // Check if it's an authentication error
    if (error.type === 'StripeAuthenticationError' || error.statusCode === 401) {
      return NextResponse.json(
        { 
          error: 'Invalid Stripe API key. Please check your configuration.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create payment intent',
        type: error.type,
        code: error.code
      },
      { status: 500 }
    )
  }
}