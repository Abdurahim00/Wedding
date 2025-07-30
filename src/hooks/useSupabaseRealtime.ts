import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client only if credentials are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseAnonKey && supabaseAnonKey !== 'your-anon-key-here'
  ? createClient(supabaseUrl, supabaseAnonKey, {
      db: {
        schema: 'wedding'
      }
    })
  : null

export function useSupabaseRealtime(days: (Date | null)[]) {
  const [dateAvailability, setDateAvailability] = useState<Map<string, boolean>>(new Map())
  const [datePrices, setDatePrices] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  
  // Force fallback to regular polling until wedding schema is exposed in Supabase
  if (!supabase || true) { // Always use regular polling for now
    console.warn('Using regular polling. Wedding schema needs to be exposed in Supabase dashboard for realtime.')
    // Return the regular hook instead
    const regularHook = require('./useCalendarData')
    return regularHook.useCalendarData(days)
  }

  // Fetch initial data
  const fetchData = useCallback(async () => {
    if (!supabase) return
    
    const validDates = days.filter((d): d is Date => d !== null)
    if (validDates.length === 0) return

    setLoading(true)
    
    try {
      // Get date range for query
      const startDate = new Date(Math.min(...validDates.map(d => d.getTime())))
      const endDate = new Date(Math.max(...validDates.map(d => d.getTime())))
      
      // Fetch date prices from wedding schema
      const { data: prices, error: priceError } = await supabase
        .from('DatePrice')
        .select('*')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
      
      if (priceError) {
        console.error('Error fetching prices:', priceError)
      }

      // Fetch bookings from wedding schema
      const { data: bookings, error: bookingError } = await supabase
        .from('Booking')
        .select('*')
        .in('status', ['confirmed', 'pending'])
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
      
      if (bookingError) {
        console.error('Error fetching bookings:', bookingError)
      }

      // Update state
      const newAvailability = new Map<string, boolean>()
      const newPrices = new Map<string, number>()

      validDates.forEach(date => {
        const dateKey = date.toDateString()
        const dateStr = date.toISOString()
        
        // Check if date has price settings
        const priceData = prices?.find(p => 
          new Date(p.date).toDateString() === dateKey
        )
        
        // Check if date is booked
        const isBooked = bookings?.some(b => 
          new Date(b.date).toDateString() === dateKey
        )
        
        newAvailability.set(dateKey, priceData?.isAvailable !== false && !isBooked)
        newPrices.set(dateKey, priceData?.price || 5000)
      })

      setDateAvailability(newAvailability)
      setDatePrices(newPrices)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!supabase) return
    
    // Listen to DatePrice changes
    const priceChannel = supabase
      .channel('date-price-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'wedding',
          table: 'DatePrice'
        },
        (payload) => {
          console.log('🔴 Real-time update: Date price changed!', payload)
          
          if (payload.new) {
            const date = new Date(payload.new.date)
            const dateKey = date.toDateString()
            
            // Update local state immediately
            setDateAvailability(prev => {
              const newMap = new Map(prev)
              newMap.set(dateKey, payload.new.isAvailable)
              return newMap
            })
            
            setDatePrices(prev => {
              const newMap = new Map(prev)
              newMap.set(dateKey, payload.new.price)
              return newMap
            })
          }
        }
      )
      .subscribe()

    // Listen to Booking changes
    const bookingChannel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'wedding',
          table: 'Booking'
        },
        (payload) => {
          console.log('New booking!', payload)
          
          if (payload.new && ['confirmed', 'pending'].includes(payload.new.status)) {
            const date = new Date(payload.new.date)
            const dateKey = date.toDateString()
            
            // Mark date as unavailable
            setDateAvailability(prev => {
              const newMap = new Map(prev)
              newMap.set(dateKey, false)
              return newMap
            })
          }
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(priceChannel)
      supabase.removeChannel(bookingChannel)
    }
  }, [])

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