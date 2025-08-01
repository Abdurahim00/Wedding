import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json()
    const checkDate = new Date(date)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (checkDate < today) {
      return NextResponse.json({ available: false })
    }
    
    const startOfDay = new Date(checkDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(checkDate)
    endOfDay.setHours(23, 59, 59, 999)
    
    // Check if date is marked as unavailable
    const datePrice = await prisma.datePrice.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })
    
    if (datePrice && !datePrice.isAvailable) {
      return NextResponse.json({ available: false })
    }
    
    // Check for existing bookings
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['confirmed', 'pending']
        }
      }
    })
    
    return NextResponse.json({ available: !existingBooking })
  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
  }
}