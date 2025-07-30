import { NextResponse } from 'next/server'

export async function GET() {
  // Log environment variables (hide sensitive parts)
  const dbUrl = process.env.DATABASE_URL || 'NOT SET'
  const hasDbUrl = !!process.env.DATABASE_URL
  const dbUrlPreview = hasDbUrl ? dbUrl.substring(0, 30) + '...' : 'NOT SET'
  
  const directUrl = process.env.DIRECT_URL || 'NOT SET'
  const hasDirectUrl = !!process.env.DIRECT_URL
  
  // Check Supabase vars
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Try to parse DATABASE_URL
  let urlParts = null
  let parseError = null
  
  if (hasDbUrl) {
    try {
      const url = new URL(dbUrl)
      urlParts = {
        protocol: url.protocol,
        username: url.username,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        searchParams: url.searchParams.toString()
      }
    } catch (error) {
      parseError = error.message
    }
  }
  
  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    database: {
      DATABASE_URL_exists: hasDbUrl,
      DATABASE_URL_preview: dbUrlPreview,
      DIRECT_URL_exists: hasDirectUrl,
      URL_parsed: urlParts,
      parse_error: parseError
    },
    supabase: {
      SUPABASE_URL_exists: hasSupabaseUrl,
      SUPABASE_KEY_exists: hasSupabaseKey
    },
    timestamp: new Date().toISOString()
  })
}