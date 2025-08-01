import { prisma } from '@/src/lib/prisma'

export interface PricingRule {
  id: string
  name: string
  type: 'weekend' | 'weekday' | 'season' | 'holiday'
  price: number
  startDate?: Date | null
  endDate?: Date | null
  daysOfWeek: number[]
  priority: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class PricingRuleModel {
  static async create(rule: Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<PricingRule> {
    return await prisma.pricingRule.create({
      data: rule
    })
  }

  static async findAll(): Promise<PricingRule[]> {
    return await prisma.pricingRule.findMany({
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
    })
  }

  static async findActive(): Promise<PricingRule[]> {
    return await prisma.pricingRule.findMany({
      where: { isActive: true },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
    })
  }

  static async update(id: string, data: Partial<PricingRule>): Promise<PricingRule> {
    return await prisma.pricingRule.update({
      where: { id },
      data
    })
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await prisma.pricingRule.delete({
        where: { id }
      })
      return true
    } catch {
      return false
    }
  }

  static async getPriceForDate(date: Date): Promise<number> {
    // First check if there's a specific date price
    const datePrice = await prisma.datePrice.findFirst({
      where: {
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999))
        }
      }
    })

    if (datePrice) {
      return datePrice.price
    }

    // Get all active rules
    const rules = await this.findActive()
    
    // Apply rules based on priority
    for (const rule of rules) {
      if (this.ruleShouldApply(rule, date)) {
        return rule.price
      }
    }

    // Default price
    return 5000
  }

  private static ruleShouldApply(rule: PricingRule, date: Date): boolean {
    const dayOfWeek = date.getDay()

    switch (rule.type) {
      case 'weekend':
        return rule.daysOfWeek.includes(dayOfWeek)
      
      case 'weekday':
        return rule.daysOfWeek.includes(dayOfWeek)
      
      case 'season':
        if (!rule.startDate || !rule.endDate) return false
        return date >= rule.startDate && date <= rule.endDate
      
      case 'holiday':
        if (!rule.startDate || !rule.endDate) return false
        return date >= rule.startDate && date <= rule.endDate
      
      default:
        return false
    }
  }
}