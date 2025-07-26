"use client"

import { useState } from "react"
import { X, CreditCard, Smartphone, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PaymentModalProps {
  bookingData: any
  onClose: () => void
  onComplete: () => void
}

type PaymentMethod = "stripe" | "klarna" | "swish"
type PaymentStatus = "selecting" | "processing" | "success" | "error"

export default function PaymentModal({ bookingData, onClose, onComplete }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("stripe")
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("selecting")
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  })

  const handlePayment = async () => {
    setPaymentStatus("processing")

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1

    if (success) {
      setPaymentStatus("success")
      setTimeout(() => {
        onComplete()
      }, 2000)
    } else {
      setPaymentStatus("error")
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  if (!bookingData) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-serif text-gray-900">Complete Payment</h2>
          {paymentStatus === "selecting" && (
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {paymentStatus === "success" && (
          <div className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
            <p className="text-gray-600 mb-4">
              Your wedding venue has been successfully booked for {bookingData.date.toLocaleDateString()}.
            </p>
            <p className="text-sm text-gray-500">A confirmation email has been sent to {bookingData.email}</p>
          </div>
        )}

        {paymentStatus === "error" && (
          <div className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-6">There was an issue processing your payment. Please try again.</p>
            <Button onClick={() => setPaymentStatus("selecting")} className="bg-rose-600 hover:bg-rose-700 text-white">
              Try Again
            </Button>
          </div>
        )}

        {paymentStatus === "processing" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment...</h3>
            <p className="text-gray-600">Please wait while we process your payment securely.</p>
          </div>
        )}

        {paymentStatus === "selecting" && (
          <>
            {/* Booking Summary */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{bookingData.date.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{bookingData.guestCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Event Type:</span>
                  <span className="capitalize">{bookingData.eventType}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t">
                  <span>Total:</span>
                  <span>${bookingData.price}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setSelectedMethod("stripe")}
                  className={`w-full p-4 border rounded-lg flex items-center gap-3 transition-colors ${
                    selectedMethod === "stripe" ? "border-rose-500 bg-rose-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Credit/Debit Card</span>
                </button>

                <button
                  onClick={() => setSelectedMethod("klarna")}
                  className={`w-full p-4 border rounded-lg flex items-center gap-3 transition-colors ${
                    selectedMethod === "klarna" ? "border-rose-500 bg-rose-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-5 h-5 bg-pink-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    K
                  </div>
                  <span>Klarna</span>
                </button>

                <button
                  onClick={() => setSelectedMethod("swish")}
                  className={`w-full p-4 border rounded-lg flex items-center gap-3 transition-colors ${
                    selectedMethod === "swish" ? "border-rose-500 bg-rose-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Smartphone className="h-5 w-5" />
                  <span>Swish</span>
                </button>
              </div>

              {/* Payment Forms */}
              {selectedMethod === "stripe" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.number}
                      onChange={(e) =>
                        setCardData((prev) => ({
                          ...prev,
                          number: formatCardNumber(e.target.value),
                        }))
                      }
                      maxLength={19}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        type="text"
                        placeholder="MM/YY"
                        value={cardData.expiry}
                        onChange={(e) =>
                          setCardData((prev) => ({
                            ...prev,
                            expiry: formatExpiry(e.target.value),
                          }))
                        }
                        maxLength={5}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        type="text"
                        placeholder="123"
                        value={cardData.cvc}
                        onChange={(e) =>
                          setCardData((prev) => ({
                            ...prev,
                            cvc: e.target.value.replace(/\D/g, "").substring(0, 4),
                          }))
                        }
                        maxLength={4}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      type="text"
                      placeholder="John Doe"
                      value={cardData.name}
                      onChange={(e) =>
                        setCardData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {selectedMethod === "klarna" && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">You will be redirected to Klarna to complete your payment.</p>
                  <p className="text-sm text-gray-500">Pay in 4 interest-free installments</p>
                </div>
              )}

              {selectedMethod === "swish" && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">You will receive a Swish notification to complete the payment.</p>
                  <p className="text-sm text-gray-500">Make sure you have the Swish app installed</p>
                </div>
              )}

              <Button
                onClick={handlePayment}
                className="w-full mt-6 bg-rose-600 hover:bg-rose-700 text-white"
                disabled={
                  selectedMethod === "stripe" &&
                  (!cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name)
                }
              >
                Complete Payment - ${bookingData.price}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">Your payment information is secure and encrypted</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
