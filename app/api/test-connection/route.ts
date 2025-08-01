import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results = {
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
    },
    connection: null as any,
    error: null as any,
    prismaTest: null as any,
  }

  try {
    // Test basic Prisma connection
    const startTime = Date.now()
    const count = await prisma.booking.count()
    const endTime = Date.now()
    
    results.prismaTest = {
      success: true,
      bookingCount: count,
      responseTime: `${endTime - startTime}ms`
    }
    
    results.connection = 'success'
  } catch (error) {
    results.error = {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      code: (error as any)?.code,
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }
    results.connection = 'failed'
  }

  return NextResponse.json(results, { 
    status: results.connection === 'success' ? 200 : 500 
  })
}