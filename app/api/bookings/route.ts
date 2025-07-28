import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const booking = await prisma.booking.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        guestCount: data.guestCount,
        eventType: data.eventType,
        specialRequests: data.specialRequests,
        date: new Date(data.date),
        price: data.price,
        status: data.status || 'pending'
      }
    })
    
    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}