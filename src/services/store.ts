import { create } from 'zustand'
import { BookingModel, PaymentModel } from '@/src/models'
import type { Booking, Payment } from '@/src/types'
import { emailService } from '@/src/services/emailService'
import { databaseService } from '@/src/services/database'

interface AppStore {
  bookingModel: BookingModel
  paymentModel: PaymentModel
  currentBooking: Booking | null
  currentPayment: Payment | null
  
  setCurrentBooking: (booking: Booking | null) => void
  setCurrentPayment: (payment: Payment | null) => void
  
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Booking>
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<Booking | undefined>
  deleteBooking: (id: string) => Promise<boolean>
  getAllBookings: () => Promise<Booking[]>
  
  processPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'status'>) => Promise<Payment>
  updatePaymentStatus: (id: string, status: Payment['status']) => Promise<Payment | undefined>
  
  isDateAvailable: (date: Date) => Promise<boolean>
  getUnavailableDates: () => Promise<Date[]>
  
  // Database methods
  getDatePrice: (date: Date) => Promise<number>
  setDatePrice: (date: string, price: number) => Promise<void>
  getAllDatePrices: () => Promise<{ date: Date; price: number }[]>
  getVideoUrl: () => Promise<string>
  setVideoUrl: (url: string) => Promise<void>
}

export const useStore = create<AppStore>((set, get) => {
  const bookingModel = new BookingModel()
  const paymentModel = new PaymentModel()

  return {
    bookingModel,
    paymentModel,
    currentBooking: null,
    currentPayment: null,

    setCurrentBooking: (booking) => set({ currentBooking: booking }),
    setCurrentPayment: (payment) => set({ currentPayment: payment }),

    createBooking: async (bookingData) => {
      const booking = await bookingModel.createBooking(bookingData)
      set({ currentBooking: booking })
      return booking
    },

    updateBooking: async (id, updates) => {
      const booking = await bookingModel.updateBooking(id, updates)
      if (booking && get().currentBooking?.id === id) {
        set({ currentBooking: booking })
      }
      return booking
    },

    deleteBooking: async (id) => {
      const result = await bookingModel.deleteBooking(id)
      if (result && get().currentBooking?.id === id) {
        set({ currentBooking: null })
      }
      return result
    },

    getAllBookings: async () => {
      return await bookingModel.getAllBookings()
    },

    processPayment: async (paymentData) => {
      console.log('Store: Processing payment...', paymentData)
      const payment = await paymentModel.processPayment(paymentData)
      console.log('Store: Payment model returned:', payment)
      set({ currentPayment: payment })
      
      // Find the booking by ID from payment data
      const booking = await bookingModel.getBooking(paymentData.bookingId)
      console.log('Store: Found booking for payment:', booking)
      
      if (payment.status === 'completed' && booking) {
        console.log('Store: Payment completed, updating booking:', booking)
        const updatedBooking = await get().updateBooking(booking.id!, { status: 'confirmed' })
        console.log('Store: Booking updated:', updatedBooking)
        
        // Send confirmation email
        console.log('Store: Sending confirmation email to:', booking.email)
        await emailService.sendBookingConfirmation({...booking, status: 'confirmed'}, booking.email)
        console.log('Store: Email sent successfully')
      } else {
        console.log('Store: Payment not completed or booking not found')
      }
      
      return payment
    },

    updatePaymentStatus: async (id, status) => {
      const payment = await paymentModel.updatePaymentStatus(id, status)
      if (payment && get().currentPayment?.id === id) {
        set({ currentPayment: payment })
      }
      return payment
    },

    isDateAvailable: async (date) => bookingModel.isDateAvailable(date),
    getUnavailableDates: async () => bookingModel.getUnavailableDates(),
    
    // Database methods
    getDatePrice: async (date) => databaseService.getDatePrice(date),
    setDatePrice: async (date, price) => {
      const dateObj = new Date(date)
      await databaseService.setDatePrice(dateObj, price)
    },
    getAllDatePrices: async () => databaseService.getAllDatePrices(),
    getVideoUrl: async () => databaseService.getVideoUrl(),
    setVideoUrl: async (url) => databaseService.setVideoUrl(url)
  }
})