import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Use direct connection - NO POOLING
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:Programmer4life!@db.eijqprtljludapmpxbgh.supabase.co:5432/postgres?schema=wedding"

export const prisma = global.prisma || new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}