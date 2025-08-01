import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: "API works",
    env: !!process.env.DATABASE_URL,
    time: new Date().toISOString()
  })
}