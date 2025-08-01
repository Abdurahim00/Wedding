import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data: settings, error } = await supabase
      .rpc('get_wedding_venue_settings')
      .single()
    
    if (error || !settings) {
      // Return default if no settings exist
      return NextResponse.json({ videoUrl: '' })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching venue settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch venue settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { videoUrl } = body
    
    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      )
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Use RPC function to update venue settings
    const { error } = await supabase
      .rpc('update_wedding_venue_settings', {
        p_video_url: videoUrl
      })
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({
      success: true,
      videoUrl
    })
  } catch (error) {
    console.error('Error updating venue settings:', error)
    return NextResponse.json(
      { error: 'Failed to update venue settings' },
      { status: 500 }
    )
  }
}