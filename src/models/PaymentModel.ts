import type { Payment } from '@/src/types'
import { prisma } from '@/src/lib/prisma'

export class PaymentModel {
  async createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const newPayment = await prisma.payment.create({
      data: {
        bookingId: payment.bookingId,
        amount: payment.amount,
        stripePaymentId: payment.cardNumber === 'stripe' ? undefined : payment.cardNumber,
        status: payment.status
      }
    })
    
    return this.convertPrismaPayment(newPayment)
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const payment = await prisma.payment.findUnique({
      where: { id }
    })
    
    return payment ? this.convertPrismaPayment(payment) : undefined
  }

  async getPaymentByBookingId(bookingId: string): Promise<Payment | undefined> {
    const payment = await prisma.payment.findUnique({
      where: { bookingId }
    })
    
    return payment ? this.convertPrismaPayment(payment) : undefined
  }

  async updatePaymentStatus(id: string, status: Payment['status']): Promise<Payment | undefined> {
    try {
      const payment = await prisma.payment.update({
        where: { id },
        data: { status }
      })
      
      return this.convertPrismaPayment(payment)
    } catch {
      return undefined
    }
  }

  async processPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'status'>): Promise<Payment> {
    // For Stripe payments, we just record the payment as completed
    const newPayment = await this.createPayment({
      ...payment,
      status: 'completed'
    })
    
    return newPayment
  }

  private convertPrismaPayment(prismaPayment: any): Payment {
    return {
      id: prismaPayment.id,
      bookingId: prismaPayment.bookingId,
      amount: prismaPayment.amount,
      cardNumber: prismaPayment.stripePaymentId || 'stripe',
      expiryDate: 'stripe',
      cvv: 'stripe',
      billingAddress: 'stripe',
      status: prismaPayment.status as Payment['status'],
      createdAt: new Date(prismaPayment.createdAt)
    }
  }
}