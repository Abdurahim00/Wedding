import { NextRequest, NextResponse } from 'next/server'

// Store active connections
const clients = new Set<ReadableStreamDefaultController>()

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Add this client to the set
      clients.add(controller)
      
      // Send initial connection message
      controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'))
      
      // Keep connection alive
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(':keepalive\n\n'))
        } catch {
          clearInterval(keepAlive)
          clients.delete(controller)
        }
      }, 30000)
      
      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive)
        clients.delete(controller)
      })
    },
  })
  
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// Export a function to broadcast to all clients
export function broadcastUpdate(data: any) {
  const encoder = new TextEncoder()
  const message = encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
  
  clients.forEach(client => {
    try {
      client.enqueue(message)
    } catch {
      // Client disconnected
      clients.delete(client)
    }
  })
}