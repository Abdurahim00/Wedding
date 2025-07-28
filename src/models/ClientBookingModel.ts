import type { Booking } from '@/src/types'

export class ClientBookingModel {
  private bookings: Map<string, Booking> = new Map()
  private unavailableDates: Set<string> = new Set()

  constructor() {
    // Initialize with empty data
  }

  createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Booking {
    const newBooking: Booking = {
      ...booking,
      id: this.generateId(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    this.bookings.set(newBooking.id!, newBooking)
    this.unavailableDates.add(booking.date.toDateString())
    
    return newBooking
  }

  getBooking(id: string): Booking | undefined {
    return this.bookings.get(id)
  }

  updateBooking(id: string, updates: Partial<Booking>): Booking | undefined {
    const booking = this.bookings.get(id)
    if (!booking) return undefined

    const updatedBooking = {
      ...booking,
      ...updates,
      updatedAt: new Date()
    }

    this.bookings.set(id, updatedBooking)
    return updatedBooking
  }

  deleteBooking(id: string): boolean {
    const booking = this.bookings.get(id)
    if (!booking) return false

    this.bookings.delete(id)
    this.unavailableDates.delete(booking.date.toDateString())
    return true
  }

  getAllBookings(): Booking[] {
    return Array.from(this.bookings.values())
  }

  isDateAvailable(date: Date): boolean {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (date < today) return false
    
    return !this.unavailableDates.has(date.toDateString())
  }

  getUnavailableDates(): Date[] {
    return Array.from(this.unavailableDates).map(dateStr => new Date(dateStr))
  }

  private generateId(): string {
    return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}