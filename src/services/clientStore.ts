import { create } from 'zustand'
import { ClientBookingModel } from '@/src/models/ClientBookingModel'
import type { Booking, Payment } from '@/src/types'
import { api } from '@/src/services/api'
import { emailService } from '@/src/services/emailService'

interface AppStore {
  bookingModel: ClientBookingModel
  currentBooking: Booking | null
  currentPayment: Payment | null
  
  setCurrentBooking: (booking: Booking | null) => void
  setCurrentPayment: (payment: Payment | null) => void
  
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Booking>
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<Booking | undefined>
  deleteBooking: (id: string) => Promise<boolean>
  getAllBookings: () => Promise<Booking[]>
  
  processPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'status'>) => Promise<Payment>
  
  isDateAvailable: (date: Date) => Promise<boolean>
  getDatePrice: (date: Date) => Promise<number>
  setDatePrice: (date: string, price: number) => Promise<void>
}

export const useStore = create<AppStore>((set, get) => {
  const bookingModel = new ClientBookingModel()

  return {
    bookingModel,
    currentBooking: null,
    currentPayment: null,

    setCurrentBooking: (booking) => set({ currentBooking: booking }),
    setCurrentPayment: (payment) => set({ currentPayment: payment }),

    createBooking: async (bookingData) => {
      try {
        // Create booking via API
        const booking = await api.createBooking(bookingData)
        set({ currentBooking: booking })
        return booking
      } catch (error) {
        console.error('Failed to create booking:', error)
        throw error
      }
    },

    updateBooking: async (id, updates) => {
      try {
        const booking = await api.updateBooking(id, updates)
        if (get().currentBooking?.id === id) {
          set({ currentBooking: booking })
        }
        return booking
      } catch (error) {
        console.error('Failed to update booking:', error)
        return undefined
      }
    },

    deleteBooking: async (id) => {
      try {
        await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
        if (get().currentBooking?.id === id) {
          set({ currentBooking: null })
        }
        return true
      } catch (error) {
        console.error('Failed to delete booking:', error)
        return false
      }
    },

    getAllBookings: async () => {
      try {
        return await api.getAllBookings()
      } catch (error) {
        console.error('Failed to fetch bookings:', error)
        return []
      }
    },

    processPayment: async (paymentData) => {
      console.log('Store: Processing payment...', paymentData)
      
      // Create payment record
      const payment: Payment = {
        id: `payment_${Date.now()}`,
        bookingId: paymentData.bookingId,
        amount: paymentData.amount,
        cardNumber: paymentData.cardNumber,
        expiryDate: paymentData.expiryDate,
        cvv: paymentData.cvv,
        billingAddress: paymentData.billingAddress,
        status: 'completed',
        createdAt: new Date()
      }
      
      set({ currentPayment: payment })
      
      // Update booking status
      const booking = await api.getBooking(paymentData.bookingId)
      
      if (payment.status === 'completed' && booking) {
        console.log('Store: Payment completed, updating booking:', booking)
        const updatedBooking = await get().updateBooking(booking.id!, { status: 'confirmed' })
        console.log('Store: Booking updated:', updatedBooking)
        
        // Send confirmation email
        console.log('Store: Sending confirmation email to:', booking.email)
        await emailService.sendBookingConfirmation({...booking, status: 'confirmed'}, booking.email)
        console.log('Store: Email sent successfully')
      }
      
      return payment
    },

    isDateAvailable: async (date) => {
      try {
        return await api.checkAvailability(date)
      } catch (error) {
        console.error('Failed to check availability:', error)
        return true // Assume available on error
      }
    },
    
    getDatePrice: async (date) => {
      try {
        return await api.getDatePrice(date)
      } catch (error) {
        console.error('Failed to get date price:', error)
        return 3 // Default price
      }
    },
    
    setDatePrice: async (date, price) => {
      try {
        const dateObj = new Date(date)
        await api.setDatePrice(dateObj, price)
      } catch (error) {
        console.error('Failed to set date price:', error)
      }
    }
  }
})