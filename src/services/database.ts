import { prisma } from '@/src/lib/prisma'

export const databaseService = {
  // Date Prices
  async getDatePrice(date: Date): Promise<number> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    const datePrice = await prisma.datePrice.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })
    
    return datePrice?.price || 3 // Default to 3 SEK (Stripe minimum)
  },

  async setDatePrice(date: Date, price: number): Promise<void> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    await prisma.datePrice.upsert({
      where: {
        date: startOfDay
      },
      update: {
        price
      },
      create: {
        date: startOfDay,
        price
      }
    })
  },

  async getAllDatePrices(): Promise<{ date: Date; price: number }[]> {
    const prices = await prisma.datePrice.findMany()
    return prices.map(p => ({
      date: new Date(p.date),
      price: p.price
    }))
  },

  // Venue Settings
  async getVideoUrl(): Promise<string> {
    const settings = await prisma.venueSettings.findFirst()
    return settings?.videoUrl || '/placeholder-video.mp4'
  },

  async setVideoUrl(url: string): Promise<void> {
    const settings = await prisma.venueSettings.findFirst()
    
    if (settings) {
      await prisma.venueSettings.update({
        where: { id: settings.id },
        data: { videoUrl: url }
      })
    } else {
      await prisma.venueSettings.create({
        data: { videoUrl: url }
      })
    }
  },

  // Admin
  async validateAdmin(username: string, password: string): Promise<boolean> {
    // For simplicity in production launch, we'll use a hardcoded admin
    // In a real production app, you'd hash passwords properly
    return username === 'admin' && password === 'admin123'
  }
}