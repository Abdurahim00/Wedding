import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.venueSettings.findFirst()
    
    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await prisma.venueSettings.create({
        data: {
          videoUrl: ''
        }
      })
      return NextResponse.json(defaultSettings)
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
    
    // Check if settings exist
    const existingSettings = await prisma.venueSettings.findFirst()
    
    let settings
    if (existingSettings) {
      // Update existing settings
      settings = await prisma.venueSettings.update({
        where: { id: existingSettings.id },
        data: { videoUrl }
      })
    } else {
      // Create new settings
      settings = await prisma.venueSettings.create({
        data: { videoUrl }
      })
    }
    
    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error) {
    console.error('Error updating venue settings:', error)
    return NextResponse.json(
      { error: 'Failed to update venue settings' },
      { status: 500 }
    )
  }
}