import { useState, useEffect } from 'react'
import { api } from '@/src/services/api'

export function useCalendarData(days: (Date | null)[]) {
  const [dateAvailability, setDateAvailability] = useState<Map<string, boolean>>(new Map())
  const [datePrices, setDatePrices] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Create a stable key from the days array
    const daysKey = days
      .filter((d): d is Date => d !== null)
      .map(d => d.toDateString())
      .join(',')
    
    if (!daysKey) return

    const checkDates = async () => {
      setLoading(true)
      
      // Filter out null dates
      const validDates = days.filter((d): d is Date => d !== null)
      
      // Check availability and prices for all dates in parallel
      const promises = validDates.map(async (date) => {
        const dateKey = date.toDateString()
        
        try {
          // Check availability
          const available = await api.checkAvailability(date)
          
          // Get price
          const price = await api.getDatePrice(date)
          
          return { dateKey, available, price }
        } catch (error) {
          console.error('Error checking date:', date, error)
          return { dateKey, available: true, price: 3 }
        }
      })

      const results = await Promise.all(promises)
      
      // Update state
      const newAvailability = new Map<string, boolean>()
      const newPrices = new Map<string, number>()
      
      results.forEach(({ dateKey, available, price }) => {
        newAvailability.set(dateKey, available)
        newPrices.set(dateKey, price)
      })
      
      setDateAvailability(newAvailability)
      setDatePrices(newPrices)
      setLoading(false)
    }

    checkDates()
  }, [days.length]) // Only re-run when the number of days changes

  const isDateAvailable = (date: Date): boolean => {
    return dateAvailability.get(date.toDateString()) ?? true
  }

  const getDatePrice = (date: Date): number => {
    return datePrices.get(date.toDateString()) ?? 3
  }

  return {
    isDateAvailable,
    getDatePrice,
    loading
  }
}