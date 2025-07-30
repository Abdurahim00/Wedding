import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { withWeddingSchema } from '@/src/lib/db-utils'

// Cache for pricing rules to avoid repeated queries
let rulesCache: any[] | null = null
let rulesCacheTime = 0
const CACHE_DURATION = 30000 // 30 seconds

export async function POST(request: NextRequest) {
  try {
    const { dates } = await request.json()
    
    if (!dates || !Array.isArray(dates)) {
      return NextResponse.json({ error: 'Invalid dates array' }, { status: 400 })
    }
    
    // Ensure connection
    await prisma.$connect()
    
    // Process all dates in a single query
    const results = await withWeddingSchema(async () => {
      return await Promise.all(
      dates.map(async (dateStr: string) => {
        const date = new Date(dateStr)
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)
        
        // Get date price and availability
        const datePrice = await prisma.datePrice.findFirst({
          where: {
            date: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        })
        
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
        
        // Calculate price (with rules if no specific date price)
        let price = datePrice?.price
        
        if (!price) {
          const dayOfWeek = date.getDay()
          
          // Get pricing rules with caching
          let rules
          if (!rulesCache || Date.now() - rulesCacheTime > CACHE_DURATION) {
            rules = await prisma.pricingRule.findMany({
              where: { isActive: true },
              orderBy: { priority: 'desc' }
            })
            rulesCache = rules
            rulesCacheTime = Date.now()
          } else {
            rules = rulesCache
          }
          
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
                  shouldApply = date >= rule.startDate && date <= rule.endDate
                }
                break
            }
            
            if (shouldApply) {
              price = rule.price
              break
            }
          }
        }
        
        // Check if past date
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const isPast = date < today
        
        return {
          date: dateStr,
          available: !isPast && (!datePrice || datePrice.isAvailable) && !existingBooking,
          price: price || 5000
        }
      })
    )
    })
    
    // Return results array directly
    return NextResponse.json({ dates: results })
  } catch (error) {
    console.error('Error fetching calendar data:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch calendar data',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 })
  }
}