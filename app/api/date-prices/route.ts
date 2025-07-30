import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { pusherServer } from '@/src/lib/pusher'

export const dynamic = 'force-dynamic'

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
      
      const datePrice = await prisma.datePrice.findFirst({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })
      
      if (datePrice) {
        return NextResponse.json({ price: datePrice.price })
      }
      
      // No specific date price, check pricing rules
      const dayOfWeek = checkDate.getDay()
      
      // Get all active pricing rules
      const rules = await prisma.pricingRule.findMany({
        where: { isActive: true },
        orderBy: { priority: 'desc' }
      })
      
      // Apply rules based on priority
      for (const rule of rules) {
        let shouldApply = false
        
        switch (rule.type) {
          case 'weekend':
          case 'weekday':
            shouldApply = rule.daysOfWeek.includes(dayOfWeek)
            break
            
          case 'season':
          case 'holiday':
            if (rule.startDate && rule.endDate) {
              shouldApply = checkDate >= rule.startDate && checkDate <= rule.endDate
            }
            break
        }
        
        if (shouldApply) {
          return NextResponse.json({ price: rule.price })
        }
      }
      
      // Default price
      return NextResponse.json({ price: 5000 })
    }
    
    // Get all date prices
    const prices = await prisma.datePrice.findMany()
    return NextResponse.json(prices)
  } catch (error) {
    console.error('Error fetching date prices:', error)
    return NextResponse.json({ error: 'Failed to fetch date prices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, price, isAvailable } = await request.json()
    const dateObj = new Date(date)
    dateObj.setHours(0, 0, 0, 0)
    
    const datePrice = await prisma.datePrice.upsert({
      where: { date: dateObj },
      update: { 
        price,
        ...(isAvailable !== undefined && { isAvailable })
      },
      create: { 
        date: dateObj, 
        price,
        isAvailable: isAvailable ?? true
      }
    })
    
    // Broadcast the change to all connected clients
    try {
      await pusherServer.trigger('calendar-updates', 'date-changed', {
        date: dateObj.toISOString(),
        price,
        isAvailable: isAvailable ?? true
      })
    } catch (error) {
      console.error('Failed to broadcast update:', error)
    }
    
    return NextResponse.json(datePrice)
  } catch (error) {
    console.error('Error setting date price:', error)
    return NextResponse.json({ error: 'Failed to set date price' }, { status: 500 })
  }
}