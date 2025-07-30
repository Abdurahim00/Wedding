import { prisma } from '@/src/lib/prisma'

export interface VenueSettings {
  id: string
  videoUrl: string
  createdAt: Date
  updatedAt: Date
}

export class VenueSettingsModel {
  static async get(): Promise<VenueSettings | null> {
    return await prisma.venueSettings.findFirst()
  }

  static async updateVideoUrl(videoUrl: string): Promise<VenueSettings> {
    const existing = await this.get()
    
    if (existing) {
      return await prisma.venueSettings.update({
        where: { id: existing.id },
        data: { videoUrl }
      })
    }
    
    return await prisma.venueSettings.create({
      data: { videoUrl }
    })
  }

  static async getVideoUrl(): Promise<string | null> {
    const settings = await this.get()
    return settings?.videoUrl || null
  }
}