import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { emailService } from '@/src/services/emailService'

export const dynamic = 'force-dynamic'

// Initialize Supabase client without schema specification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Use RPC function to get all bookings
    const { data: bookings, error } = await supabase
      .rpc('get_wedding_bookings_all')
    
    if (error) {
      console.error('Error fetching bookings:', error)
      throw error
    }
    
    return NextResponse.json(bookings || [])
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch bookings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Received booking data:', data)
    
    const bookingDate = new Date(data.date)
    
    // Check if past date first
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (bookingDate < today) {
      return NextResponse.json(
        { error: 'Cannot book past dates' },
        { status: 400 }
      )
    }
    
    // Use RPC function to create booking
    const { data: booking, error } = await supabase.rpc('create_wedding_booking', {
      booking_name: data.name,
      booking_email: data.email,
      booking_phone: data.phone,
      booking_guest_count: data.guestCount,
      booking_event_type: data.eventType,
      booking_special_requests: data.specialRequests || '',
      booking_date: bookingDate.toISOString(),
      booking_price: data.price,
      booking_status: data.status || 'pending'
    })
    
    if (error) {
      console.error('RPC Error:', error)
      return NextResponse.json({ 
        error: 'Failed to create booking',
        details: error.message,
        hint: error.hint,
        code: error.code
      }, { status: 500 })
    }
    
    const createdBooking = booking[0] || booking
    
    // Send confirmation email
    try {
      if (createdBooking) {
        console.log('Attempting to send email to:', createdBooking.email)
        const emailSent = await emailService.sendBookingConfirmation(createdBooking, createdBooking.email)
        if (emailSent) {
          console.log('✅ Confirmation email sent successfully to:', createdBooking.email)
        } else {
          console.log('❌ Failed to send confirmation email to:', createdBooking.email)
        }
      }
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error)
      // Don't fail the booking if email fails
    }
    
    return NextResponse.json(createdBooking)
  } catch (error) {
    console.error('Error creating booking:', error)
    
    return NextResponse.json({ 
      error: 'Failed to create booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}