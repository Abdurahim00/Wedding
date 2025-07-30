import { useState, useEffect, useCallback } from 'react'
import { pusherClient } from '@/src/lib/pusher'
import { api } from '@/src/services/api'

export function useRealtimeCalendar(days: (Date | null)[]) {
  const [dateAvailability, setDateAvailability] = useState<Map<string, boolean>>(new Map())
  const [datePrices, setDatePrices] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  
  // Create a stable identifier for the current set of days
  const daysIdentifier = days
    .filter((d): d is Date => d !== null)
    .map(d => d.toISOString().split('T')[0])
    .join(',')

  const fetchCalendarData = useCallback(async () => {
    if (!daysIdentifier) return
    
    setLoading(true)
    
    try {
      const validDates = days.filter((d): d is Date => d !== null)
      
      if (validDates.length === 0) {
        setLoading(false)
        return
      }
      
      // Use batch endpoint
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
          newAvailability.set(dateKey, true)
          newPrices.set(dateKey, 5000)
        }
      })
      
      setDateAvailability(newAvailability)
      setDatePrices(newPrices)
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setLoading(false)
    }
  }, [days, daysIdentifier])

  // Initial fetch
  useEffect(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  // Set up Pusher for real-time updates
  useEffect(() => {
    const channel = pusherClient.subscribe('calendar-updates')
    
    channel.bind('date-changed', (data: {
      date: string
      price: number
      isAvailable: boolean
    }) => {
      const changedDate = new Date(data.date)
      const dateKey = changedDate.toDateString()
      
      // Update local state immediately
      setDateAvailability(prev => {
        const newMap = new Map(prev)
        newMap.set(dateKey, data.isAvailable)
        return newMap
      })
      
      setDatePrices(prev => {
        const newMap = new Map(prev)
        newMap.set(dateKey, data.price)
        return newMap
      })
    })
    
    // Also listen for booking changes
    channel.bind('booking-created', () => {
      // Refetch data when a new booking is created
      fetchCalendarData()
    })
    
    return () => {
      pusherClient.unsubscribe('calendar-updates')
    }
  }, [fetchCalendarData])

  const isDateAvailable = (date: Date): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return false
    
    return dateAvailability.get(date.toDateString()) ?? true
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