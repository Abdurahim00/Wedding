import { prisma } from './prisma'

export async function withWeddingSchema<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    // Always set schema before any operation
    await prisma.$executeRaw`SET search_path TO wedding`
    return await operation()
  } catch (error) {
    console.error('Database operation failed:', error)
    throw error
  }
}