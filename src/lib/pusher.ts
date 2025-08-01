import Pusher from 'pusher'
import PusherClient from 'pusher-js'

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || 'your-app-id',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'your-key',
  secret: process.env.PUSHER_SECRET || 'your-secret',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
  useTLS: true,
})

// Client-side Pusher instance
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY || 'your-key',
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
  }
)