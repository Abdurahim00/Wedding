"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface AdminAuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (password: string) => boolean
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if admin is already authenticated
    const authToken = localStorage.getItem('adminAuth')
    if (authToken === 'authenticated') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = (password: string) => {
    // Simple password check - in production, this should be properly secured
    if (password === 'admin123') {
      localStorage.setItem('adminAuth', 'authenticated')
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem('adminAuth')
    setIsAuthenticated(false)
    router.push('/')
  }

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}