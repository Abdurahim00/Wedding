import { useState, useCallback } from 'react'
import { useStore } from '@/src/services/clientStore'
import type { Booking } from '@/src/types'

export function useBookingFlow() {
  const store = useStore()
  const [isCreatingBooking, setIsCreatingBooking] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [datePrice, setDatePrice] = useState<number>(3)
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)

  const fetchDatePrice = useCallback((date: Date) => {
    setIsLoadingPrice(true)
    store.getDatePrice(date)
      .then(price => {
        setDatePrice(price)
      })
      .catch(error => {
        console.error('Failed to fetch date price:', error)
        setDatePrice(3) // Default price
      })
      .finally(() => {
        setIsLoadingPrice(false)
      })
  }, [store])

  const createBooking = useCallback((
    bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>,
    onSuccess: (booking: Booking) => void,
    onError?: (error: Error) => void
  ) => {
    setIsCreatingBooking(true)
    setBookingError(null)

    store.createBooking(bookingData)
      .then(booking => {
        setIsCreatingBooking(false)
        onSuccess(booking)
      })
      .catch(error => {
        setIsCreatingBooking(false)
        setBookingError(error.message)
        if (onError) onError(error)
      })
  }, [store])

  const processPayment = useCallback((
    bookingData: Booking,
    paymentDetails: any,
    onSuccess: () => void,
    onError?: (error: Error) => void
  ) => {
    store.processPayment({
      ...paymentDetails,
      bookingId: bookingData.id!,
      amount: bookingData.price
    })
      .then(() => {
        onSuccess()
      })
      .catch(error => {
        if (onError) onError(error)
      })
  }, [store])

  return {
    createBooking,
    processPayment,
    fetchDatePrice,
    datePrice,
    isLoadingPrice,
    isCreatingBooking,
    bookingError
  }
}