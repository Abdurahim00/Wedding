import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
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
    const videoUrl = await uploadVideoToSupabase(file)
    
    // Save video URL to database
    const existingSettings = await prisma.venueSettings.findFirst()
    
    if (existingSettings) {
      await prisma.venueSettings.update({
        where: { id: existingSettings.id },
        data: { videoUrl }
      })
    } else {
      await prisma.venueSettings.create({
        data: { videoUrl }
      })
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