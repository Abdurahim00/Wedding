const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst()
    if (existingAdmin) {
      console.log('Admin already exists!')
      return
    }

    // Create default admin
    const passwordHash = await bcrypt.hash('admin123', 10)
    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        passwordHash
      }
    })

    console.log('Admin created successfully!')
    console.log('Username: admin')
    console.log('Password: admin123')
    console.log('Please change the password after first login!')
  } catch (error) {
    console.error('Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()