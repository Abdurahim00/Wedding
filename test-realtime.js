const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://eijqprtljludapmpxbgh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpanFwcnRsamx1ZGFwbXB4YmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTk5OTAsImV4cCI6MjA2NTM5NTk5MH0.bD5WS91YmBYCL_EUD3JuK0eLFTRR1cmZqCmQ5K-kGik'

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'wedding'
  }
})

async function testRealtime() {
  console.log('🔌 Connecting to Supabase Realtime...')
  
  // Subscribe to DatePrice changes
  const channel = supabase
    .channel('test-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'wedding',
        table: 'DatePrice'
      },
      (payload) => {
        console.log('✅ Real-time update received!', payload)
      }
    )
    .subscribe((status) => {
      console.log('📡 Subscription status:', status)
    })
  
  console.log('👂 Listening for changes...')
  console.log('🔧 Go to your admin panel and change a date price to test!')
  
  // Keep the script running
  process.stdin.resume()
}

testRealtime()