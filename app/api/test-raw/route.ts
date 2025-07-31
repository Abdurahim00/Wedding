import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    // Create fresh client with explicit URL
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: "postgresql://postgres:Programmer4life!@db.eijqprtljludapmpxbgh.supabase.co:5432/postgres"
        }
      }
    })
    
    // Try raw SQL
    const result = await prisma.$queryRaw`SELECT 1 as test`
    await prisma.$disconnect()
    
    return NextResponse.json({ success: true, result })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}