import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Test with Supabase client
    const { data, error } = await supabase
      .from('wedding.Booking')
      .select('id')
      .limit(1)
    
    if (error) throw error
    
    return NextResponse.json({ 
      success: true, 
      method: 'supabase-client',
      data 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}