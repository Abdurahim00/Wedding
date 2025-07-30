import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET() {
  const results: any = {
    step1_raw_query: null,
    step2_tables_in_wedding: null,
    step3_direct_booking_query: null,
    step4_prisma_booking_count: null,
    errors: []
  }

  try {
    // Step 1: Check what schema we're in
    try {
      const currentSchema = await prisma.$queryRaw`SELECT current_schema()`
      results.step1_raw_query = currentSchema
    } catch (e: any) {
      results.errors.push({ step: 1, error: e.message })
    }

    // Step 2: Check if we can see wedding schema tables
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'wedding'
        LIMIT 5
      `
      results.step2_tables_in_wedding = tables
    } catch (e: any) {
      results.errors.push({ step: 2, error: e.message })
    }

    // Step 3: Try direct query to wedding.Booking
    try {
      const bookings = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM wedding."Booking"
      `
      results.step3_direct_booking_query = bookings
    } catch (e: any) {
      results.errors.push({ step: 3, error: e.message })
    }

    // Step 4: Try using Prisma's generated client
    try {
      const count = await prisma.booking.count()
      results.step4_prisma_booking_count = count
    } catch (e: any) {
      results.errors.push({ step: 4, error: e.message })
    }

  } catch (error: any) {
    results.main_error = error.message
  }

  return NextResponse.json(results)
}