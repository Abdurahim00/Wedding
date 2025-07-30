import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// This endpoint is called whenever date availability changes
export async function POST(request: NextRequest) {
  try {
    const { date, available } = await request.json()
    
    // In a production app, you might use WebSockets or Server-Sent Events here
    // For now, we'll just return success and let the polling handle it
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process update' }, { status: 500 })
  }
}