import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET() {
  const results: any = {
    env: {
      hasDirectUrl: !!process.env.DATABASE_URL,
      hasPrismaUrl: !!process.env.DATABASE_PRISMA_URL,
      nodeEnv: process.env.NODE_ENV,
    },
    connection: false,
    schema: null,
    tables: [],
    error: null
  }

  try {
    // Test basic connection
    await prisma.$connect()
    results.connection = true

    // Check current schema
    const schemaResult = await prisma.$queryRaw`SELECT current_schema()`
    results.schema = schemaResult

    // Try to set wedding schema
    await prisma.$executeRaw`SET search_path TO wedding`
    
    // Check schema after setting
    const schemaAfter = await prisma.$queryRaw`SELECT current_schema()`
    results.schemaAfter = schemaAfter

    // List tables in wedding schema
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'wedding'
      ORDER BY table_name
    `
    results.tables = tables

    // Test a simple query
    const bookingCount = await prisma.booking.count()
    results.bookingCount = bookingCount

  } catch (error) {
    results.error = error instanceof Error ? {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    } : String(error)
  } finally {
    await prisma.$disconnect()
  }

  return NextResponse.json(results, { status: 200 })
}