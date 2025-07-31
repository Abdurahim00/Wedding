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
    
    const results = await Promise.all(
      dates.map(async (dateStr: string) => {
        const date = new Date(dateStr)
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)
        
        const { data: datePrice } = await supabase
          .from('DatePrice')
          .select('*')
          .gte('date', startOfDay.toISOString())
          .lte('date', endOfDay.toISOString())
          .single()
        
        const { data: bookings } = await supabase
          .from('Booking')
          .select('id')
          .gte('date', startOfDay.toISOString())
          .lte('date', endOfDay.toISOString())
          .in('status', ['confirmed', 'pending'])
        
        const existingBooking = bookings && bookings.length > 0
        
        let price = datePrice?.price || 5000
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const isPast = date < today
        
        return {
          date: dateStr,
          available: !isPast && (!datePrice || datePrice.isAvailable) && !existingBooking,
          price: price
        }
      })
    )
    
    return NextResponse.json({ dates: results })
  } catch (error) {
    console.error('Calendar data error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch calendar data'
    }, { status: 500 })
  }
}