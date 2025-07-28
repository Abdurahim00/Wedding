import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { bookingId, amount } = await request.json()
    
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        stripePaymentId: 'stripe',
        status: 'completed'
      }
    })
    
    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}