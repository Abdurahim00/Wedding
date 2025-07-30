import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const prismaOptions = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
}

// Create a custom PrismaClient that sets schema on every query
class PrismaClientWithSchema extends PrismaClient {
  async $connect() {
    await super.$connect()
    // Set schema after connecting
    await this.$executeRaw`SET search_path TO wedding`
  }
}

export const prisma = global.prisma || new PrismaClientWithSchema(prismaOptions)

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}