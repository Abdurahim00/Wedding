import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    // In development, we can skip signature verification if webhook secret not set
    if (process.env.NODE_ENV === 'development' && !process.env.STRIPE_WEBHOOK_SECRET) {
      event = JSON.parse(body) as Stripe.Event
    } else {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment succeeded:', paymentIntent.id)
      console.log('Metadata:', paymentIntent.metadata)
      
      // Extract booking info from metadata
      const { bookingId, customerEmail, customerName } = paymentIntent.metadata
      
      if (bookingId) {
        // Update booking status directly in database
        const { prisma } = await import('@/src/lib/prisma')
        const { emailService } = await import('@/src/services/emailService')
        
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId }
        })
        
        if (booking) {
          // Update booking status
          await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'confirmed' }
          })
          
          // Create payment record
          await prisma.payment.create({
            data: {
              bookingId: bookingId,
              amount: paymentIntent.amount / 100,
              stripePaymentId: paymentIntent.id,
              status: 'completed'
            }
          })
          
          // Send confirmation email
          await emailService.sendBookingConfirmation(
            { ...booking, status: 'confirmed' },
            booking.email
          )
          
          console.log('Booking confirmed via webhook for:', bookingId)
        }
      }
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}