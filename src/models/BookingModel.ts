import type { Booking } from '@/src/types'
import { prisma } from '@/src/lib/prisma'

export class BookingModel {
  async createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const newBooking = await prisma.booking.create({
      data: {
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        guestCount: booking.guestCount,
        eventType: booking.eventType,
        specialRequests: booking.specialRequests,
        date: booking.date,
        price: booking.price,
        status: booking.status || 'pending'
      }
    })
    
    return this.convertPrismaBooking(newBooking)
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const booking = await prisma.booking.findUnique({
      where: { id }
    })
    
    return booking ? this.convertPrismaBooking(booking) : undefined
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined> {
    try {
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: updates
      })
      
      return this.convertPrismaBooking(updatedBooking)
    } catch (error) {
      return undefined
    }
  }

  async deleteBooking(id: string): Promise<boolean> {
    try {
      await prisma.booking.delete({
        where: { id }
      })
      return true
    } catch {
      return false
    }
  }

  async getAllBookings(): Promise<Booking[]> {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return bookings.map(b => this.convertPrismaBooking(b))
  }

  async isDateAvailable(date: Date): Promise<boolean> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (date < today) return false
    
    // Check if there's a confirmed booking for this date
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['confirmed', 'pending']
        }
      }
    })
    
    return !existingBooking
  }

  async getUnavailableDates(): Promise<Date[]> {
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ['confirmed', 'pending']
        }
      },
      select: {
        date: true
      }
    })
    
    return bookings.map(b => new Date(b.date))
  }

  private convertPrismaBooking(prismaBooking: any): Booking {
    return {
      id: prismaBooking.id,
      name: prismaBooking.name,
      email: prismaBooking.email,
      phone: prismaBooking.phone,
      guestCount: prismaBooking.guestCount,
      eventType: prismaBooking.eventType as Booking['eventType'],
      specialRequests: prismaBooking.specialRequests || undefined,
      date: new Date(prismaBooking.date),
      price: prismaBooking.price,
      status: prismaBooking.status as Booking['status'],
      createdAt: new Date(prismaBooking.createdAt),
      updatedAt: new Date(prismaBooking.updatedAt)
    }
  }
}