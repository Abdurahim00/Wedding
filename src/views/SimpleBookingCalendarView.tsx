"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, CalendarDays } from "lucide-react"
import { format } from "date-fns"

interface SimpleBookingCalendarViewProps {
  currentDate: Date
  days: (Date | null)[]
  onDateSelect: (date: Date) => void
  onNavigateMonth: (direction: "prev" | "next") => void
}

export default function SimpleBookingCalendarView({
  currentDate,
  days,
  onDateSelect,
  onNavigateMonth
}: SimpleBookingCalendarViewProps) {
  
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="glass-morphism rounded-3xl p-8 shadow-2xl">
        {/* Premium Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CalendarDays className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">Select Your Date</span>
          </div>
          <p className="text-gray-500 text-sm">Choose from our available dates to begin your journey</p>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-8 px-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigateMonth("prev")}
            className="hover:bg-white/50 rounded-2xl transition-all duration-300 hover:shadow-lg"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
          
          <h2 className="text-2xl font-serif text-gray-900">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigateMonth("next")}
            className="hover:bg-white/50 rounded-2xl transition-all duration-300 hover:shadow-lg"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Days of the week */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
            <div
              key={index}
              className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="aspect-square" />
            }

            const past = isPastDate(date)
            const today = isToday(date)
            const weekend = isWeekend(date)

            return (
              <button
                key={index}
                onClick={() => !past && onDateSelect(date)}
                disabled={past}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-medium
                  transition-all duration-300 relative group
                  ${
                    !past
                      ? "hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 hover:shadow-lg hover:scale-105 cursor-pointer"
                      : "cursor-not-allowed"
                  }
                  ${
                    past
                      ? "text-gray-300 bg-gray-50/50"
                      : weekend
                      ? "text-gray-800 bg-gradient-to-br from-purple-50/50 to-blue-50/50"
                      : "text-gray-700 bg-white/50 hover:bg-white"
                  }
                  ${today ? "ring-2 ring-purple-400 ring-offset-2 ring-offset-white/50" : ""}
                `}
              >
                <span className="text-base">{date.getDate()}</span>
              </button>
            )
          })}
        </div>

        {/* Premium Legend */}
        <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
          <div className="flex items-center justify-around text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white rounded-lg shadow-sm" />
              <span className="text-gray-600 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg" />
              <span className="text-gray-600 font-medium">Weekend</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 rounded-lg" />
              <span className="text-gray-600 font-medium">Past Date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}