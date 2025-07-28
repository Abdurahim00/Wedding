import { useState, useCallback, useMemo } from 'react'
import { useStore } from '@/src/services/clientStore'
import type { Booking } from '@/src/types'

export function useBookingViewModel() {
  const store = useStore()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }, [])

  const selectDate = useCallback((date: Date) => {
    // Check availability and then set date
    store.isDateAvailable(date).then(available => {
      if (available) {
        setSelectedDate(date)
      }
    })
  }, [store])

  const getDaysInMonth = useCallback((date: Date): (Date | null)[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }, [])

  const days = useMemo(() => 
    getDaysInMonth(currentDate),
    [currentDate, getDaysInMonth]
  )

  return {
    selectedDate,
    currentDate,
    bookingData: store.currentBooking,
    days,
    navigateMonth,
    selectDate,
    isDateAvailable: store.isDateAvailable,
    setSelectedDate,
    setBookingData: store.setCurrentBooking
  }
}