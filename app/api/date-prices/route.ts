import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    
    if (date) {
      // Get price for specific date
      const checkDate = new Date(date)
      const startOfDay = new Date(checkDate)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(checkDate)
      endOfDay.setHours(23, 59, 59, 999)
      
      // Use RPC function to get date price
      const { data: datePrices, error } = await supabase
        .rpc('get_wedding_date_prices', {
          start_date: startOfDay.toISOString(),
          end_date: endOfDay.toISOString()
        })
      
      if (error) {
        console.error('Error fetching date price:', error)
        throw error
      }
      
      if (datePrices && datePrices.length > 0) {
        return NextResponse.json({ price: datePrices[0].price })
      }
      
      // Default price if no specific date price
      return NextResponse.json({ price: 5000 })
    }
    
    // Get all date prices
    const { data: prices, error } = await supabase
      .rpc('get_all_wedding_date_prices')
    
    if (error) {
      // If function doesn't exist, try fetching with date range
      const today = new Date()
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 2)
      
      const { data: datePrices, error: rangeError } = await supabase
        .rpc('get_wedding_date_prices', {
          start_date: today.toISOString(),
          end_date: futureDate.toISOString()
        })
      
      if (rangeError) {
        throw rangeError
      }
      
      // Map is_available to isAvailable for frontend compatibility
      const mappedPrices = (datePrices || []).map((dp: any) => ({
        ...dp,
        isAvailable: dp.is_available
      }))
      
      return NextResponse.json(mappedPrices)
    }
    
    // Map is_available to isAvailable for frontend compatibility
    const mappedPrices = (prices || []).map((p: any) => ({
      ...p,
      isAvailable: p.is_available
    }))
    
    return NextResponse.json(mappedPrices)
  } catch (error) {
    console.error('Error fetching date prices:', error)
    return NextResponse.json({ error: 'Failed to fetch date prices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, price, isAvailable } = await request.json()
    console.log('Updating date price:', { date, price, isAvailable })
    
    const dateObj = new Date(date)
    dateObj.setHours(0, 0, 0, 0)
    
    // Use RPC function to upsert date price
    const { data, error } = await supabase.rpc('upsert_wedding_date_price', {
      p_date: dateObj.toISOString(),
      p_price: price,
      p_is_available: isAvailable ?? true
    })
    
    if (error) {
      console.error('Error updating date price:', error)
      return NextResponse.json({ 
        error: 'Failed to set date price',
        details: error.message,
        hint: error.hint,
        code: error.code
      }, { status: 500 })
    }
    
    console.log('Date price updated successfully:', data)
    
    // Map the response to match frontend expectations
    const mappedData = data && data[0] ? {
      ...data[0],
      isAvailable: data[0].is_available
    } : data
    
    return NextResponse.json(mappedData)
  } catch (error: any) {
    console.error('Error setting date price:', error)
    return NextResponse.json({ 
      error: 'Failed to set date price',
      details: error.message || 'Unknown error'
    }, { status: 500 })
  }
}