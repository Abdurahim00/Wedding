import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET() {
  let connectionResult = null
  let connectionError = null
  let rawQueryResult = null
  let rawQueryError = null
  
  try {
    // Try a simple Prisma query
    connectionResult = await prisma.$queryRaw`SELECT 1`
    
    // Try to check if wedding schema exists
    rawQueryResult = await prisma.$queryRaw`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'wedding'
    `
  } catch (error: any) {
    connectionError = {
      message: error.message,
      code: error.code,
      meta: error.meta,
      clientVersion: error.clientVersion,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    }
  }
  
  // Try raw query to list all schemas
  let schemas = null
  try {
    schemas = await prisma.$queryRaw`
      SELECT schema_name 
      FROM information_schema.schemata 
      ORDER BY schema_name
    `
  } catch (error: any) {
    rawQueryError = {
      message: error.message,
      code: error.code
    }
  }
  
  // Get connection info
  const dbUrl = process.env.DATABASE_URL || ''
  const urlParts = dbUrl.split('@')
  const hostInfo = urlParts[1] ? urlParts[1].split('/')[0] : 'unknown'
  
  return NextResponse.json({
    connection: {
      success: !!connectionResult,
      error: connectionError,
      host: hostInfo
    },
    schemas: {
      wedding_exists: !!rawQueryResult,
      all_schemas: schemas,
      error: rawQueryError
    },
    timestamp: new Date().toISOString()
  })
}