"use client"

import { useState, useEffect } from "react"
import { X, CreditCard, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import StripePaymentForm from "@/src/components/StripePaymentForm"
import type { Booking } from "@/src/types"
import { format } from "date-fns"
import { sv } from "date-fns/locale"

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-morphism w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl shadow-2xl overflow-y-auto animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="relative p-4 sm:p-8 text-center border-b border-gray-200/20">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 sm:right-4 top-2 sm:top-4 rounded-full hover:bg-white/20 h-10 w-10 sm:h-9 sm:w-9"
            aria-label="Stäng"
          >
            <X className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>

          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-3 sm:mb-4">
            <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
          </div>

          <h2 className="text-xl sm:text-3xl font-serif text-gray-900 mb-2">Slutför din bokning</h2>
          <p className="text-sm sm:text-base text-gray-600">Säker betalning för din speciella dag</p>
        </div>

        {/* Booking Summary */}
        <div className="p-4 sm:p-8 border-b border-gray-200/20">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Bokningssammanfattning</h3>
          <div className="space-y-4 text-base">
            <div className="flex justify-between">
              <span className="text-gray-600">Datum</span>
              <span className="font-medium">{format(new Date(bookingData.date), "EEEE d MMMM yyyy", { locale: sv })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Typ av evenemang</span>
              <span className="font-medium capitalize">{
                bookingData.eventType === 'wedding' ? 'Bröllop' :
                bookingData.eventType === 'reception' ? 'Mottagning' :
                bookingData.eventType === 'anniversary' ? 'Jubileum' :
                bookingData.eventType === 'corporate' ? 'Företagsevent' :
                bookingData.eventType === 'other' ? 'Annat firande' :
                bookingData.eventType
              }</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gäster</span>
              <span className="font-medium">{bookingData.guestCount} personer</span>
            </div>
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <span className="text-lg font-semibold">Totalt</span>
              <span className="text-lg font-semibold">{bookingData.price} SEK</span>
            </div>
          </div>
        </div>

        {/* Payment Content */}
        <div className="p-4 sm:p-8">
          {paymentStatus === "selecting" && (
            <>
              {isLoadingPayment ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                  <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-purple-600 mb-6" />
                  <p className="text-base sm:text-lg text-gray-600">Förbereder säker betalning...</p>
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
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-100 mb-6">
                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-purple-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3">Bearbetar betalning</h3>
              <p className="text-base sm:text-lg text-gray-600">Vänligen vänta medan vi bekräftar din betalning...</p>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3">Betalning genomförd!</h3>
              <p className="text-base sm:text-lg text-gray-600 mb-8">
                Din bokning har bekräftats. Kolla din e-post för detaljer.
              </p>
              <Button onClick={onComplete} className="btn-premium rounded-xl py-4 text-base font-medium">
                Klar
              </Button>
            </div>
          )}

          {paymentStatus === "error" && (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 mb-6">
                <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3">Betalning misslyckades</h3>
              <p className="text-base sm:text-lg text-gray-600 mb-8">
                {paymentError || "Något gick fel. Försök igen."}
              </p>
              <div className="space-y-4">
                <Button onClick={onRetry} className="w-full btn-premium rounded-xl py-4 text-base font-medium">
                  Försök igen
                </Button>
                <Button onClick={onClose} variant="outline" className="w-full rounded-xl py-4 text-base font-medium">
                  Avbryt
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="px-4 sm:px-8 pb-4 sm:pb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-gray-500 text-center">
            <span>🔒 Säker betalning via Stripe</span>
            <span className="hidden sm:inline">•</span>
            <span>Din data är krypterad</span>
          </div>
        </div>
      </div>
    </div>
  )
}