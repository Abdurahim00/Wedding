import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { pusherServer } from '@/src/lib/pusher'
import { emailService } from '@/src/services/emailService'

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch bookings',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const bookingDate = new Date(data.date)
    
    // Ensure connection
    await prisma.$connect()
    
    // Server-side validation: Check if date is available
    const startOfDay = new Date(bookingDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(bookingDate)
    endOfDay.setHours(23, 59, 59, 999)
    
    // Check if past date first (no DB needed)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (bookingDate < today) {
      return NextResponse.json(
        { error: 'Cannot book past dates' },
        { status: 400 }
      )
    }
    
    // Create booking with validation
    try {
      // Check if date is marked as unavailable
      const datePrice = await prisma.datePrice.findFirst({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })
      
      if (datePrice && !datePrice.isAvailable) {
        throw new Error('This date is not available for booking')
      }
      
      // Check for existing bookings
      const existingBooking = await prisma.booking.findFirst({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: {
            in: ['confirmed', 'pending']
          }
        }
      })
      
      if (existingBooking) {
        throw new Error('This date is already booked')
      }
      
      // Create booking only if all validations pass
      return await prisma.booking.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          guestCount: data.guestCount,
          eventType: data.eventType,
          specialRequests: data.specialRequests,
          date: bookingDate,
          price: data.price,
          status: data.status || 'pending'
        }
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('not available')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      if (error instanceof Error && error.message.includes('already booked')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      throw error
    }
    
    // Send confirmation email
    try {
      console.log('Attempting to send email to:', booking.email)
      const emailSent = await emailService.sendBookingConfirmation(booking, booking.email)
      if (emailSent) {
        console.log('✅ Confirmation email sent successfully to:', booking.email)
      } else {
        console.log('❌ Failed to send confirmation email to:', booking.email)
      }
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error)
      // Don't fail the booking if email fails
    }
    
    // Broadcast the new booking (disabled - using polling instead)
    // try {
    //   await pusherServer.trigger('calendar-updates', 'booking-created', {
    //     date: bookingDate.toISOString(),
    //     bookingId: booking.id
    //   })
    // } catch (error) {
    //   console.error('Failed to broadcast booking:', error)
    // }
    
    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error creating booking:', error)
    
    // Handle specific validation errors
    if (error instanceof Error) {
      if (error.message.includes('not available') || error.message.includes('already booked')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to create booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}