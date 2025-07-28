import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

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
      
      return NextResponse.json({ price: datePrice?.price || 3 })
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
    const { date, price } = await request.json()
    const dateObj = new Date(date)
    dateObj.setHours(0, 0, 0, 0)
    
    const datePrice = await prisma.datePrice.upsert({
      where: { date: dateObj },
      update: { price },
      create: { date: dateObj, price }
    })
    
    return NextResponse.json(datePrice)
  } catch (error) {
    console.error('Error setting date price:', error)
    return NextResponse.json({ error: 'Failed to set date price' }, { status: 500 })
  }
}