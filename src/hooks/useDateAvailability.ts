import { useState, useEffect } from 'react'
import { api } from '@/src/services/api'

export function useDateAvailability() {
  const [availabilityCache, setAvailabilityCache] = useState<Map<string, boolean>>(new Map())
  const [checkingDates, setCheckingDates] = useState<Set<string>>(new Set())

  const checkDateAvailability = (date: Date, callback?: (available: boolean) => void) => {
    const dateKey = date.toDateString()
    
    // Return cached value if available
    if (availabilityCache.has(dateKey)) {
      const available = availabilityCache.get(dateKey)!
      if (callback) callback(available)
      return available
    }

    // Already checking this date
    if (checkingDates.has(dateKey)) {
      return false
    }

    // Mark as checking
    setCheckingDates(prev => new Set(prev).add(dateKey))

    // Check availability
    api.checkAvailability(date)
      .then(available => {
        setAvailabilityCache(prev => new Map(prev).set(dateKey, available))
        setCheckingDates(prev => {
          const next = new Set(prev)
          next.delete(dateKey)
          return next
        })
        if (callback) callback(available)
      })
      .catch(error => {
        console.error('Failed to check availability:', error)
        setCheckingDates(prev => {
          const next = new Set(prev)
          next.delete(dateKey)
          return next
        })
        if (callback) callback(true) // Assume available on error
      })

    return false // Return false while checking
  }

  const isDateAvailable = (date: Date): boolean => {
    const dateKey = date.toDateString()
    return availabilityCache.get(dateKey) ?? true
  }

  return {
    checkDateAvailability,
    isDateAvailable,
    availabilityCache
  }
}