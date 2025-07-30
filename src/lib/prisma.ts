import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Get the database URL and add statement_cache_size=0 if not present
function getDatabaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) return url
  
  // Add statement_cache_size=0 to prevent prepared statement errors with PgBouncer
  if (!url.includes('statement_cache_size=')) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}statement_cache_size=0`
  }
  return url
}

const prismaOptions = {
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
} as const

export const prisma = global.prisma || new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}