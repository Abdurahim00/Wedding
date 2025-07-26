"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BookingCalendarProps {
  onDateSelect: (date: Date) => void
}

export default function BookingCalendar({ onDateSelect }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Mock unavailable dates (in a real app, this would come from your backend)
  const unavailableDates = useMemo(() => {
    const dates = new Set<string>()
    const today = new Date()

    // Add some random unavailable dates
    for (let i = 0; i < 10; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + Math.floor(Math.random() * 60))
      dates.add(date.toDateString())
    }

    return dates
  }, [])

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isDateAvailable = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Can't book dates in the past
    if (date < today) return false

    // Check if date is in unavailable dates
    return !unavailableDates.has(date.toDateString())
  }

  const days = getDaysInMonth(currentDate)

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-serif text-gray-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-rose-500" />
          Book Your Date
        </h3>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")} aria-label="Previous month">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h4 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>

        <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")} aria-label="Next month">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <div key={index} className="aspect-square">
            {date ? (
              <button
                onClick={() => isDateAvailable(date) && onDateSelect(date)}
                disabled={!isDateAvailable(date)}
                className={`
                  w-full h-full rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isDateAvailable(date)
                      ? "bg-rose-50 text-rose-700 hover:bg-rose-100 hover:scale-105 cursor-pointer"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }
                  focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1
                `}
                aria-label={`${isDateAvailable(date) ? "Available" : "Unavailable"} date: ${date.toDateString()}`}
              >
                {date.getDate()}
              </button>
            ) : (
              <div className="w-full h-full"></div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-rose-50 border border-rose-200 rounded"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span className="text-gray-600">Unavailable</span>
        </div>
      </div>
    </div>
  )
}
