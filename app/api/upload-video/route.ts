import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/src/lib/prisma'

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
    
    // Check file size (4MB limit for Vercel)
    const maxSize = 4 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 4MB limit. Please use a smaller video or compress it.' },
        { status: 400 }
      )
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'videos')
    await mkdir(uploadsDir, { recursive: true })
    
    // Generate unique filename
    const timestamp = Date.now()
    const extension = path.extname(file.name)
    const filename = `venue-video-${timestamp}${extension}`
    const filepath = path.join(uploadsDir, filename)
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)
    
    // Save video URL to database
    const videoUrl = `/uploads/videos/${filename}`
    
    // Check if settings exist
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