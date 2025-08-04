"use client"

import React, { useState } from 'react'
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { stripePromise } from '@/src/lib/stripe'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { Booking } from '@/src/types'

interface StripePaymentFormProps {
  booking: Booking
  onSuccess: () => void
  onError: (error: string) => void
}

function CheckoutForm({ booking, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?booking_id=${booking.id}`,
          receipt_email: booking.email,
        },
        redirect: 'if_required',
      })

      if (error) {
        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`.
        if (error.type === "card_error" || error.type === "validation_error") {
          onError(error.message || "Payment failed")
        } else {
          onError("An unexpected error occurred.")
        }
        setIsProcessing(false)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded without redirect (some payment methods)
        console.log('Payment successful without redirect!', paymentIntent)
        onSuccess()
      }
    } catch (err) {
      console.error('Payment error:', err)
      onError('An unexpected error occurred during payment.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        options={{
          layout: "tabs",
          defaultValues: {
            billingDetails: {
              name: booking.name,
              email: booking.email,
              phone: booking.phone,
            }
          }
        }}
        className="min-h-[200px]"
      />
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full btn-premium rounded-xl py-4 sm:py-6 text-base"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${booking.price} SEK`
        )}
      </Button>
    </form>
  )
}

export default function StripePaymentForm({ booking, clientSecret, onSuccess, onError }: StripePaymentFormProps & { clientSecret: string }) {
  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#7c3aed',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#dc2626',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '12px',
    },
  }

  const options = {
    clientSecret,
    appearance,
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm booking={booking} onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}