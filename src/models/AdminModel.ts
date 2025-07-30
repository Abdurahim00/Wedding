import { prisma } from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'

export interface Admin {
  id: string
  username: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export class AdminModel {
  static async create(username: string, password: string): Promise<Admin> {
    const passwordHash = await bcrypt.hash(password, 10)
    
    return await prisma.admin.create({
      data: {
        username,
        passwordHash
      }
    })
  }

  static async findByUsername(username: string): Promise<Admin | null> {
    return await prisma.admin.findUnique({
      where: { username }
    })
  }

  static async verifyPassword(username: string, password: string): Promise<Admin | null> {
    const admin = await this.findByUsername(username)
    if (!admin) return null
    
    const isValid = await bcrypt.compare(password, admin.passwordHash)
    return isValid ? admin : null
  }

  static async changePassword(id: string, newPassword: string): Promise<Admin> {
    const passwordHash = await bcrypt.hash(newPassword, 10)
    
    return await prisma.admin.update({
      where: { id },
      data: { passwordHash }
    })
  }

  static async exists(): Promise<boolean> {
    const count = await prisma.admin.count()
    return count > 0
  }

  static async createDefaultAdmin(): Promise<Admin> {
    const exists = await this.exists()
    if (exists) {
      throw new Error('Admin already exists')
    }
    
    return await this.create('admin', 'admin123')
  }
}