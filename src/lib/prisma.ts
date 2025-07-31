import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// TEMPORARY: Hardcode the database URL to test - using pooler
const HARDCODED_DATABASE_URL = "postgresql://postgres.eijqprtljludapmpxbgh:Programmer4life!@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=wedding&connection_limit=1"

const prismaOptions = {
  datasources: {
    db: {
      url: HARDCODED_DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
} as const

export const prisma = global.prisma || new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}