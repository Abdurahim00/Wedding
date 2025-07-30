"use client"

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useStore } from '@/src/services/clientStore'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const store = useStore()
  const bookingId = searchParams.get('booking_id')

  useEffect(() => {
    const confirmBooking = async () => {
      if (bookingId) {
        // Update booking status to confirmed
        console.log('Payment success page: Updating booking status for ID:', bookingId)
        
        try {
          // Get booking details
          const response = await fetch(`/api/bookings/${bookingId}`)
          if (response.ok) {
            const booking = await response.json()
            
            // Process payment
            await store.processPayment({
              bookingId: bookingId,
              amount: booking.price,
              cardNumber: 'stripe',
              expiryDate: 'stripe',
              cvv: 'stripe',
              billingAddress: 'stripe'
            })
          }
        } catch (error) {
          console.error('Error confirming booking:', error)
        }
      }
    }
    
    confirmBooking()
  }, [bookingId, store])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="glass-morphism rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-serif text-gray-900 mb-4">Payment Successful!</h1>
        
        <p className="text-gray-600 mb-8">
          Your booking has been confirmed. We've sent a confirmation email with all the details.
        </p>
        
        <Button 
          onClick={() => router.push('/')} 
          className="w-full btn-premium rounded-xl"
        >
          Return to Home
        </Button>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}