import { useState, useCallback } from 'react'
import { useStore } from '@/src/services/clientStore'
import type { Payment, Booking } from '@/src/types'

export class PaymentViewModel {

  validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '')
    return /^\d{16}$/.test(cleaned)
  }

  validateExpiryDate(expiryDate: string): boolean {
    const pattern = /^(0[1-9]|1[0-2])\/\d{2}$/
    if (!pattern.test(expiryDate)) return false

    const [month, year] = expiryDate.split('/')
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1)
    const today = new Date()
    
    return expiry > today
  }

  validateCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv)
  }

  formatCardNumber(value: string): string {
    const cleaned = value.replace(/\s/g, '')
    const groups = cleaned.match(/.{1,4}/g) || []
    return groups.join(' ')
  }

  formatExpiryDate(value: string): string {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }
}

export function usePaymentViewModel() {
  const store = useStore()
  const [viewModel] = useState(() => new PaymentViewModel())
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const processPayment = useCallback(async (
    bookingData: Booking,
    paymentDetails: Omit<Payment, 'id' | 'createdAt' | 'status' | 'bookingId' | 'amount'>
  ) => {
    setIsProcessing(true)
    setPaymentError(null)

    try {
      const payment = await store.processPayment({
        ...paymentDetails,
        bookingId: bookingData.id!,
        amount: bookingData.price
      })
      setIsProcessing(false)
      return payment
    } catch (error) {
      setPaymentError('Payment processing failed. Please try again.')
      setIsProcessing(false)
      throw error
    }
  }, [store])

  const validatePaymentForm = useCallback((
    cardNumber: string,
    expiryDate: string,
    cvv: string,
    billingAddress: string
  ): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {}

    if (!viewModel.validateCardNumber(cardNumber)) {
      errors.cardNumber = 'Invalid card number'
    }

    if (!viewModel.validateExpiryDate(expiryDate)) {
      errors.expiryDate = 'Invalid expiry date'
    }

    if (!viewModel.validateCVV(cvv)) {
      errors.cvv = 'Invalid CVV'
    }

    if (!billingAddress.trim()) {
      errors.billingAddress = 'Billing address is required'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }, [viewModel])

  return {
    isProcessing,
    paymentError,
    processPayment,
    validatePaymentForm,
    formatCardNumber: viewModel.formatCardNumber.bind(viewModel),
    formatExpiryDate: viewModel.formatExpiryDate.bind(viewModel)
  }
}