"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface BookingContextType {
  pendingDates: Set<string>
  addPendingDate: (date: Date) => void
  removePendingDate: (date: Date) => void
  isPending: (date: Date) => boolean
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [pendingDates, setPendingDates] = useState<Set<string>>(new Set())

  const addPendingDate = (date: Date) => {
    setPendingDates(prev => {
      const newSet = new Set(prev)
      newSet.add(date.toDateString())
      return newSet
    })
  }

  const removePendingDate = (date: Date) => {
    setPendingDates(prev => {
      const newSet = new Set(prev)
      newSet.delete(date.toDateString())
      return newSet
    })
  }

  const isPending = (date: Date) => {
    return pendingDates.has(date.toDateString())
  }

  return (
    <BookingContext.Provider value={{ pendingDates, addPendingDate, removePendingDate, isPending }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBookingContext() {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBookingContext must be used within a BookingProvider')
  }
  return context
}