import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET() {
  try {
    // Test 1: Basic connection
    const connectionTest = await prisma.$queryRaw`SELECT 1 as test`
    
    // Test 2: Check if we can access wedding schema
    const schemaTest = await prisma.$queryRaw`SELECT current_schema()`
    
    // Test 3: Try to count bookings
    let bookingCount = null
    let bookingError = null
    try {
      bookingCount = await prisma.booking.count()
    } catch (error: any) {
      bookingError = error.message
    }
    
    // Test 4: Try to count date prices
    let datePriceCount = null
    let datePriceError = null
    try {
      datePriceCount = await prisma.datePrice.count()
    } catch (error: any) {
      datePriceError = error.message
    }
    
    // Test 5: Raw query to wedding schema
    let weddingTables = null
    try {
      weddingTables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'wedding'
      `
    } catch (error: any) {
      // Ignore
    }
    
    return NextResponse.json({
      success: true,
      tests: {
        connection: !!connectionTest,
        currentSchema: schemaTest,
        bookingCount,
        bookingError,
        datePriceCount,
        datePriceError,
        weddingTables
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    }, { status: 500 })
  }
}