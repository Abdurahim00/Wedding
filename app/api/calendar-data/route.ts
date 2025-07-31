import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { dates } = await request.json()
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Get the date range for batch querying
    const sortedDates = dates.sort()
    const startDate = new Date(sortedDates[0])
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(sortedDates[sortedDates.length - 1])
    endDate.setHours(23, 59, 59, 999)
    
    // Use RPC functions to access wedding schema
    const { data: datePrices, error: dpError } = await supabase
      .rpc('get_wedding_date_prices', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
    
    console.log('DatePrice query:', { datePrices, error: dpError })
    
    // Batch query for bookings
    const { data: bookings, error: bookingError } = await supabase
      .rpc('get_wedding_bookings', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
    
    console.log('Booking query:', { bookings, error: bookingError })
    
    // Create lookup maps for faster access
    const datePriceMap = new Map()
    datePrices?.forEach(dp => {
      const dateKey = new Date(dp.date).toISOString().split('T')[0]
      datePriceMap.set(dateKey, dp)
    })
    
    const bookingMap = new Map()
    bookings?.forEach(booking => {
      const dateKey = new Date(booking.date).toISOString().split('T')[0]
      bookingMap.set(dateKey, true)
    })
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const results = dates.map((dateStr: string) => {
      const date = new Date(dateStr)
      const dateKey = date.toISOString().split('T')[0]
      
      const datePrice = datePriceMap.get(dateKey)
      const existingBooking = bookingMap.has(dateKey)
      const isPast = date < today
      
      let price = datePrice?.price || 5000
      
      return {
        date: dateStr,
        available: !isPast && (!datePrice || datePrice.isAvailable) && !existingBooking,
        price: price
      }
    })
    
    console.log('Calendar data response:', { dates: results })
    return NextResponse.json({ dates: results })
  } catch (error: any) {
    console.error('Calendar data error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch calendar data',
      details: error?.message || 'Unknown error',
      code: error?.code
    }, { status: 500 })
  }
}