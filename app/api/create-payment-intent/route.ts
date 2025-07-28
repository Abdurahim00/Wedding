import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: NextRequest) {
  try {
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
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}