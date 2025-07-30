// API service for client-side data fetching
import type { Booking, Payment } from '@/src/types'

export const api = {
  // Bookings
  async createBooking(data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error('Failed to create booking')
    }
    
    return response.json()
  },

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    const response = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    
    if (!response.ok) {
      throw new Error('Failed to update booking')
    }
    
    return response.json()
  },

  async getBooking(id: string): Promise<Booking> {
    const response = await fetch(`/api/bookings/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch booking')
    }
    
    return response.json()
  },

  async getAllBookings(): Promise<Booking[]> {
    const response = await fetch('/api/bookings')
    
    if (!response.ok) {
      throw new Error('Failed to fetch bookings')
    }
    
    return response.json()
  },

  async checkAvailability(date: Date): Promise<boolean> {
    const response = await fetch('/api/bookings/check-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date })
    })
    
    if (!response.ok) {
      throw new Error('Failed to check availability')
    }
    
    const data = await response.json()
    return data.available
  },

  // Calendar Data (batch endpoint for efficiency)
  async getCalendarData(dates: Date[]): Promise<Map<string, { available: boolean; price: number }>> {
    try {
      const response = await fetch('/api/calendar-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dates: dates.map(d => d.toISOString()) 
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar data')
      }
      
      const data = await response.json()
      const result = new Map<string, { available: boolean; price: number }>()
      
      data.dates.forEach((item: any) => {
        const date = new Date(item.date)
        result.set(date.toDateString(), {
          available: item.available,
          price: item.price
        })
      })
      
      return result
    } catch (error) {
      console.error('Error fetching calendar data:', error)
      return new Map()
    }
  },
  
  // Date Prices
  async getDatePrice(date: Date): Promise<number> {
    const response = await fetch(`/api/date-prices?date=${date.toISOString()}`)
    
    if (!response.ok) {
      return 5000 // Default price
    }
    
    const data = await response.json()
    return data.price
  },

  async setDatePrice(date: Date, price: number): Promise<void> {
    const response = await fetch('/api/date-prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, price })
    })
    
    if (!response.ok) {
      throw new Error('Failed to set date price')
    }
  },

  async getAllDatePrices(): Promise<Array<{ date: string; price: number }>> {
    const response = await fetch('/api/date-prices')
    
    if (!response.ok) {
      return []
    }
    
    return response.json()
  },

  // Payments
  async processPayment(bookingId: string, amount: number): Promise<Payment> {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, amount })
    })
    
    if (!response.ok) {
      throw new Error('Failed to process payment')
    }
    
    return response.json()
  }
}