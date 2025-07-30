"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '@/src/services/api'

interface CalendarContextType {
  unavailableDates: Set<string>
  datePrices: Map<string, number>
  markDateUnavailable: (date: Date) => void
  markDateAvailable: (date: Date) => void
  isDateAvailable: (date: Date) => boolean
  getDatePrice: (date: Date) => number
  refreshData: () => Promise<void>
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set())
  const [datePrices, setDatePrices] = useState<Map<string, number>>(new Map())
  const [lastFetch, setLastFetch] = useState<number>(0)

  // Fetch all calendar data
  const fetchCalendarData = async () => {
    try {
      // Only get current month and next month for better performance
      const dates: Date[] = []
      const today = new Date()
      
      for (let monthOffset = 0; monthOffset < 2; monthOffset++) {
        const targetMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
        const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate()
        
        for (let day = 1; day <= lastDay; day++) {
          dates.push(new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day))
        }
      }
      
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
      setLastFetch(Date.now())
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchCalendarData()
  }, [])

  // Poll for updates with reasonable frequency
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCalendarData()
    }, 5000) // Poll every 5 seconds for good balance
    
    return () => clearInterval(interval)
  }, [])

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
    
    // Check unavailable set
    return !unavailableDates.has(dateKey)
  }

  const getDatePrice = (date: Date): number => {
    const dateKey = date.toDateString()
    return datePrices.get(dateKey) ?? 5000
  }

  const refreshData = async () => {
    await fetchCalendarData()
  }

  return (
    <CalendarContext.Provider value={{
      unavailableDates,
      datePrices,
      markDateUnavailable,
      markDateAvailable,
      isDateAvailable,
      getDatePrice,
      refreshData
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