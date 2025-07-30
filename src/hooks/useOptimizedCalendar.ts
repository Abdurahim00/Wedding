import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '@/src/services/api'

// Shared state across all calendar instances
let sharedState = {
  dateAvailability: new Map<string, boolean>(),
  datePrices: new Map<string, number>(),
  lastUpdate: 0,
  subscribers: new Set<() => void>()
}

export function useOptimizedCalendar(days: (Date | null)[]) {
  const [, forceUpdate] = useState({})
  const [loading, setLoading] = useState(true)
  const isMounted = useRef(true)
  
  // Subscribe to shared state updates
  useEffect(() => {
    const update = () => {
      if (isMounted.current) {
        forceUpdate({})
      }
    }
    
    sharedState.subscribers.add(update)
    
    return () => {
      isMounted.current = false
      sharedState.subscribers.delete(update)
    }
  }, [])
  
  // Fetch data for current view
  const fetchData = useCallback(async () => {
    const validDates = days.filter((d): d is Date => d !== null)
    if (validDates.length === 0) return
    
    try {
      const calendarData = await api.getCalendarData(validDates)
      
      // Update shared state
      validDates.forEach(date => {
        const dateKey = date.toDateString()
        const data = calendarData.get(dateKey)
        
        if (data) {
          sharedState.dateAvailability.set(dateKey, data.available)
          sharedState.datePrices.set(dateKey, data.price)
        }
      })
      
      sharedState.lastUpdate = Date.now()
      
      // Notify all subscribers
      sharedState.subscribers.forEach(sub => sub())
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setLoading(false)
    }
  }, [days])
  
  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  // Smart polling - more aggressive
  useEffect(() => {
    const checkForUpdates = () => {
      // Only fetch if tab is visible
      if (!document.hidden) {
        fetchData()
      }
    }
    
    // Poll every 2 seconds for better responsiveness
    const interval = setInterval(checkForUpdates, 2000)
    
    // Also check when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Check when window gets focus
    const handleFocus = () => fetchData()
    window.addEventListener('focus', handleFocus)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchData])
  
  const isDateAvailable = (date: Date): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return false
    
    return sharedState.dateAvailability.get(date.toDateString()) ?? true
  }
  
  const getDatePrice = (date: Date): number => {
    return sharedState.datePrices.get(date.toDateString()) ?? 5000
  }
  
  return {
    isDateAvailable,
    getDatePrice,
    loading
  }
}