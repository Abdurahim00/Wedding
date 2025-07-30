import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const prismaOptions = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
}

export const prisma = global.prisma || new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

// Set search_path for wedding schema
if (prisma) {
  prisma.$executeRawUnsafe('SET search_path TO wedding,public').catch(() => {
    // Ignore error on initialization
  })
}