"use client"

import { useState, useEffect } from "react"
import { X, CreditCard, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import StripePaymentForm from "@/src/components/StripePaymentForm"
import type { Booking } from "@/src/types"
import { format } from "date-fns"

interface PaymentModalViewProps {
  bookingData: Booking | null
  paymentStatus: "selecting" | "processing" | "success" | "error"
  selectedMethod: "stripe" | "klarna" | "swish"
  cardNumber: string
  expiryDate: string
  cvv: string
  billingAddress: string
  onClose: () => void
  onComplete: () => void
  onPayment: () => void
  onMethodSelect: (method: "stripe" | "klarna" | "swish") => void
  onCardNumberChange: (value: string) => void
  onExpiryDateChange: (value: string) => void
  onCvvChange: (value: string) => void
  onBillingAddressChange: (value: string) => void
  onRetry: () => void
  formatCardNumber: (value: string) => string
  formatExpiryDate: (value: string) => string
}

export default function PaymentModalView({
  bookingData,
  paymentStatus,
  onClose,
  onComplete,
  onPayment,
  onRetry,
}: PaymentModalViewProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  useEffect(() => {
    if (!bookingData) return

    // Create PaymentIntent as soon as modal opens
    const createPaymentIntent = async () => {
      setIsLoadingPayment(true)
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: bookingData.price * 100, // Convert to öre (smallest unit)
            bookingId: bookingData.id,
            customerEmail: bookingData.email,
            customerName: bookingData.name,
          }),
        })

        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to initialize payment')
        }

        setClientSecret(data.clientSecret)
      } catch (error: any) {
        console.error('Payment initialization error:', error)
        setPaymentError(error.message || 'Failed to initialize payment')
      } finally {
        setIsLoadingPayment(false)
      }
    }

    createPaymentIntent()
  }, [bookingData])

  if (!bookingData) return null

  const handlePaymentSuccess = async () => {
    console.log('Payment success handler called!')
    // Call the original onPayment to update booking status and send email
    onPayment()
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-morphism rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="relative p-8 text-center border-b border-gray-200/20">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full hover:bg-white/20"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-4">
            <CreditCard className="h-8 w-8 text-purple-600" />
          </div>

          <h2 className="text-3xl font-serif text-gray-900 mb-2">Complete Your Booking</h2>
          <p className="text-gray-600">Secure payment for your special day</p>
        </div>

        {/* Booking Summary */}
        <div className="p-8 border-b border-gray-200/20">
          <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="font-medium">{format(new Date(bookingData.date), "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Event Type</span>
              <span className="font-medium capitalize">{bookingData.eventType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guests</span>
              <span className="font-medium">{bookingData.guestCount} people</span>
            </div>
            <div className="flex justify-between pt-3 border-t">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-semibold">{bookingData.price} SEK</span>
            </div>
          </div>
        </div>

        {/* Payment Content */}
        <div className="p-8">
          {paymentStatus === "selecting" && (
            <>
              {isLoadingPayment ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
                  <p className="text-gray-600">Initializing secure payment...</p>
                </div>
              ) : paymentError ? (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {paymentError}
                  </AlertDescription>
                </Alert>
              ) : clientSecret ? (
                <StripePaymentForm
                  booking={bookingData}
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              ) : null}
            </>
          )}

          {paymentStatus === "processing" && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
              <p className="text-gray-600">Please wait while we confirm your payment...</p>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-6">
                Your booking has been confirmed. Check your email for details.
              </p>
              <Button onClick={onComplete} className="btn-premium rounded-xl">
                Done
              </Button>
            </div>
          )}

          {paymentStatus === "error" && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Payment Failed</h3>
              <p className="text-gray-600 mb-6">
                {paymentError || "Something went wrong. Please try again."}
              </p>
              <div className="space-y-3">
                <Button onClick={onRetry} className="w-full btn-premium rounded-xl">
                  Try Again
                </Button>
                <Button onClick={onClose} variant="outline" className="w-full rounded-xl">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="px-8 pb-8">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span>🔒 Secure payment powered by Stripe</span>
            <span>•</span>
            <span>Your data is encrypted</span>
          </div>
        </div>
      </div>
    </div>
  )
}