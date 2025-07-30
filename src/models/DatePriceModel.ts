import { prisma } from '@/src/lib/prisma'

export interface DatePrice {
  id: string
  date: Date
  price: number
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}

export class DatePriceModel {
  static async create(date: Date, price: number, isAvailable: boolean = true): Promise<DatePrice> {
    return await prisma.datePrice.create({
      data: {
        date,
        price,
        isAvailable
      }
    })
  }

  static async findByDate(date: Date): Promise<DatePrice | null> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    return await prisma.datePrice.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })
  }

  static async updateOrCreate(date: Date, price: number, isAvailable?: boolean): Promise<DatePrice> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const existing = await this.findByDate(date)
    
    if (existing) {
      return await prisma.datePrice.update({
        where: { id: existing.id },
        data: { 
          price,
          ...(isAvailable !== undefined && { isAvailable })
        }
      })
    }
    
    return await prisma.datePrice.create({
      data: {
        date: startOfDay,
        price,
        isAvailable: isAvailable ?? true
      }
    })
  }

  static async findAll(): Promise<DatePrice[]> {
    return await prisma.datePrice.findMany({
      orderBy: { date: 'asc' }
    })
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await prisma.datePrice.delete({
        where: { id }
      })
      return true
    } catch {
      return false
    }
  }

  static async getPriceForDate(date: Date): Promise<number> {
    const datePrice = await this.findByDate(date)
    if (datePrice) {
      return datePrice.price
    }
    
    // Check pricing rules if no specific date price
    const { PricingRuleModel } = await import('./PricingRuleModel')
    return await PricingRuleModel.getPriceForDate(date)
  }
  
  static async isDateAvailable(date: Date): Promise<boolean> {
    const datePrice = await this.findByDate(date)
    return datePrice ? datePrice.isAvailable : true
  }
}