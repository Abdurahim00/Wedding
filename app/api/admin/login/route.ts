import { NextResponse } from 'next/server'
import { AdminModel } from '@/src/models/AdminModel'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      )
    }

    // Check if any admin exists, if not create default
    const adminExists = await AdminModel.exists()
    if (!adminExists) {
      await AdminModel.createDefaultAdmin()
    }

    // Verify credentials
    const admin = await AdminModel.verifyPassword(username, password)
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}