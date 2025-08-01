"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '@/src/services/api'

interface CalendarContextType {
  unavailableDates: Set<string>
  datePrices: Map<string, number>
  markDateUnavailable: (date: Date) => void
  markDateAvailable: (date: Date) => void
  isDateAvailable: (date: Date) => boolean
  isLoading: boolean
  getDatePrice: (date: Date) => number
  refreshData: () => Promise<void>
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set())
  const [datePrices, setDatePrices] = useState<Map<string, number>>(new Map())
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Load ALL data for the next 6 months - like cinema bookings
  const loadAllCalendarData = async () => {
    try {
      setIsInitialLoading(true)
      
      const dates: Date[] = []
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Load 6 months of data (cinema style - they show ~3-6 months ahead)
      for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
        const targetMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
        const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate()
        
        for (let day = 1; day <= lastDay; day++) {
          const targetDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day)
          // Only add future dates
          if (targetDate >= today) {
            dates.push(targetDate)
          }
        }
      }
      
      // Fetch ALL data in one go
      const calendarData = await api.getCalendarData(dates)
      
      const newUnavailable = new Set<string>()
      const newPrices = new Map<string, number>()
      
      calendarData.forEach((data, dateKey) => {
        if (!data.available) {
          newUnavailable.add(dateKey)
        }
        newPrices.set(dateKey, data.price)
      })
      
      setUnavailableDates(newUnavailable)
      setDatePrices(newPrices)
      setIsInitialLoading(false)
    } catch (error) {
      console.error('Error loading calendar data:', error)
      setIsInitialLoading(false)
    }
  }

  // Load everything on mount
  useEffect(() => {
    loadAllCalendarData()
  }, [])

  // Simple refresh function
  const refreshData = async () => {
    await loadAllCalendarData()
  }

  // No need for ensureMonthLoaded - everything is already loaded!
  const ensureMonthLoaded = async () => {
    // Do nothing - data is already loaded
  }

  // Optimistic updates
  const markDateUnavailable = (date: Date) => {
    const dateKey = date.toDateString()
    setUnavailableDates(prev => new Set(prev).add(dateKey))
  }

  const markDateAvailable = (date: Date) => {
    const dateKey = date.toDateString()
    setUnavailableDates(prev => {
      const newSet = new Set(prev)
      newSet.delete(dateKey)
      return newSet
    })
  }

  const isDateAvailable = (date: Date): boolean => {
    const dateKey = date.toDateString()
    
    // Check if past date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return false
    
    // If still loading, return true (optimistic - don't show as unavailable)
    if (isInitialLoading) return true
    
    // Simple check - data is already loaded
    return !unavailableDates.has(dateKey)
  }
  
  const isDateLoading = (): boolean => {
    return isInitialLoading
  }

  const getDatePrice = (date: Date): number => {
    const dateKey = date.toDateString()
    return datePrices.get(dateKey) ?? 5000
  }

  return (
    <CalendarContext.Provider value={{
      unavailableDates,
      datePrices,
      markDateUnavailable,
      markDateAvailable,
      isDateAvailable,
      getDatePrice,
      refreshData,
      isLoading: isInitialLoading
    }}>
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error('useCalendar must be used within CalendarProvider')
  }
  return context
}