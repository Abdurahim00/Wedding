import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const Stripe = require('stripe')
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim()
    
    if (!stripeKey) {
      return NextResponse.json({ error: 'No Stripe key found' }, { status: 500 })
    }
    
    // Try to initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-11-20.acacia',
    })
    
    // Try a simple API call to verify the key works
    const balance = await stripe.balance.retrieve()
    
    return NextResponse.json({
      success: true,
      message: 'Stripe initialized successfully',
      currency: balance.available[0]?.currency || 'No balance data',
      keyFormat: stripeKey.substring(0, 7) + '...'
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode
    }, { status: 500 })
  }
}