import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const results: any = {
    request_body: null,
    date_processing: [],
    errors: [],
    prisma_models: null
  }

  try {
    // Check what Prisma models are available
    results.prisma_models = Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'))

    // Parse request
    const body = await request.json()
    results.request_body = body
    const { dates } = body

    if (!dates || !Array.isArray(dates)) {
      return NextResponse.json({ error: 'Invalid dates array' }, { status: 400 })
    }

    // Test processing one date
    const testDate = dates[0]
    if (testDate) {
      try {
        const date = new Date(testDate)
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        // Test 1: Can we query datePrice?
        let datePriceResult = null
        try {
          datePriceResult = await prisma.datePrice.findFirst({
            where: {
              date: {
                gte: startOfDay,
                lte: endOfDay
              }
            }
          })
          results.date_processing.push({ test: 'datePrice.findFirst', success: true, result: datePriceResult })
        } catch (e: any) {
          results.date_processing.push({ test: 'datePrice.findFirst', success: false, error: e.message })
        }

        // Test 2: Can we query booking?
        try {
          const bookingResult = await prisma.booking.findFirst({
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
          results.date_processing.push({ test: 'booking.findFirst', success: true, result: bookingResult })
        } catch (e: any) {
          results.date_processing.push({ test: 'booking.findFirst', success: false, error: e.message })
        }

        // Test 3: Can we query pricingRule?
        try {
          const rulesResult = await prisma.pricingRule.findMany({
            where: { isActive: true },
            orderBy: { priority: 'desc' }
          })
          results.date_processing.push({ test: 'pricingRule.findMany', success: true, count: rulesResult.length })
        } catch (e: any) {
          results.date_processing.push({ test: 'pricingRule.findMany', success: false, error: e.message })
        }

      } catch (e: any) {
        results.errors.push({ phase: 'date_processing', error: e.message })
      }
    }

  } catch (error: any) {
    results.errors.push({ phase: 'main', error: error.message, stack: error.stack?.split('\n').slice(0, 5) })
  }

  return NextResponse.json(results)
}