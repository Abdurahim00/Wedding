import { NextResponse } from 'next/server'

export async function GET() {
  // Hardcode everything for testing
  const mockData = {
    dates: [
      { date: "2025-08-01", available: true, price: 5000 },
      { date: "2025-08-02", available: false, price: 5000 },
      { date: "2025-08-03", available: true, price: 7000 }
    ]
  }
  
  return NextResponse.json(mockData)
}