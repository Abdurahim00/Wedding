import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const prismaOptions = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:Programmer4life!@db.eijqprtljludapmpxbgh.supabase.co:5432/postgres?schema=wedding"
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
} as const

export const prisma = global.prisma || new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}