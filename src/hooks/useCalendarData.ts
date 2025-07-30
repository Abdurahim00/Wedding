import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '@/src/services/api'

export function useCalendarData(days: (Date | null)[]) {
  const [dateAvailability, setDateAvailability] = useState<Map<string, boolean>>(new Map())
  const [datePrices, setDatePrices] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const isInitialLoad = useRef(true)
  const lastFetchTime = useRef<number>(0)
  const MIN_FETCH_INTERVAL = 1500 // Minimum 1.5 seconds between fetches
  
  // Create a stable identifier for the current set of days
  const daysIdentifier = days
    .filter((d): d is Date => d !== null)
    .map(d => d.toISOString().split('T')[0])
    .join(',')

  const checkDates = useCallback(async () => {
    if (!daysIdentifier) return
    
    // Throttle API calls
    const now = Date.now()
    if (now - lastFetchTime.current < MIN_FETCH_INTERVAL) {
      return
    }
    lastFetchTime.current = now
    
    // Only show loading on initial load
    if (isInitialLoad.current) {
      setLoading(true)
    }
    
    // Filter out null dates
    const validDates = days.filter((d): d is Date => d !== null)
    
    if (validDates.length === 0) {
      setLoading(false)
      return
    }
    
    try {
      // Use batch endpoint for efficiency
      const calendarData = await api.getCalendarData(validDates)
      
      // Update state
      const newAvailability = new Map<string, boolean>()
      const newPrices = new Map<string, number>()
      
      validDates.forEach(date => {
        const dateKey = date.toDateString()
        const data = calendarData.get(dateKey)
        
        if (data) {
          newAvailability.set(dateKey, data.available)
          newPrices.set(dateKey, data.price)
        } else {
          // Fallback values
          newAvailability.set(dateKey, true)
          newPrices.set(dateKey, 5000)
        }
      })
      
      setDateAvailability(newAvailability)
      setDatePrices(newPrices)
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      if (isInitialLoad.current) {
        setLoading(false)
        isInitialLoad.current = false
      }
    }
  }, [days, daysIdentifier])

  // Initial load
  useEffect(() => {
    checkDates()
  }, [checkDates])
  
  // Poll for updates with smart frequency
  useEffect(() => {
    // Only poll if the component is visible
    if (typeof document === 'undefined' || document.hidden) return
    
    const interval = setInterval(() => {
      if (!document.hidden) {
        checkDates()
      }
    }, 2000) // Check every 2 seconds when page is visible
    
    // Also check when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkDates()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [checkDates])

  const isDateAvailable = (date: Date): boolean => {
    // If still loading, return false to prevent clicks
    if (loading) return false
    return dateAvailability.get(date.toDateString()) ?? false
  }

  const getDatePrice = (date: Date): number => {
    return datePrices.get(date.toDateString()) ?? 5000
  }

  return {
    isDateAvailable,
    getDatePrice,
    loading
  }
}