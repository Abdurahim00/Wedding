import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { uploadVideoToSupabase } from '@/src/lib/supabase-storage'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('video') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
    }
    
    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload MP4, WebM, or OGG' },
        { status: 400 }
      )
    }
    
    // No size limit needed for Supabase Storage (up to 5GB)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 500MB limit.' },
        { status: 400 }
      )
    }
    
    // Upload to Supabase Storage
    // Note: The experimental buffer.File warning is expected in Node.js 18
    // and can be safely ignored as it doesn't affect functionality
    const videoUrl = await uploadVideoToSupabase(file)
    
    // Save video URL to database using Supabase RPC
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
      videoUrl,
      message: 'Video uploaded successfully'
    })
  } catch (error) {
    console.error('Error uploading video:', error)
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    )
  }
}