"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, CalendarDays } from "lucide-react"
import { format } from "date-fns"
import { useCalendar } from "@/src/contexts/CalendarContext"

interface SimpleBookingCalendarViewProps {
  currentDate: Date
  days: (Date | null)[]
  onDateSelect: (date: Date) => void
  onNavigateMonth: (direction: "prev" | "next") => void
  bookingInProgress?: Date | null
}

export default function SimpleBookingCalendarView({
  currentDate,
  days,
  onDateSelect,
  onNavigateMonth,
  bookingInProgress
}: SimpleBookingCalendarViewProps) {
  const { isDateAvailable, getDatePrice, isLoading } = useCalendar()
  
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
    <div className="w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-2 sm:px-4 lg:px-0">
      <div className="glass-morphism rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 lg:p-12 shadow-xl sm:shadow-2xl">
        {/* Premium Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-gray-600" />
            <span className="text-sm sm:text-base lg:text-lg font-medium text-gray-600 uppercase tracking-wider">Select Your Date</span>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm lg:text-base">Choose from our available dates to begin your journey</p>
          {isLoading && (
            <p className="text-xs sm:text-sm text-purple-600 mt-2 sm:mt-3 animate-pulse">Laddar tillgänglighet...</p>
          )}
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 lg:mb-12 px-2 sm:px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigateMonth("prev")}
            className="hover:bg-white/50 rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-lg w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
          >
            <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7" />
          </Button>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif text-gray-900">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigateMonth("next")}
            className="hover:bg-white/50 rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-lg w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
          >
            <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7" />
          </Button>
        </div>

        {/* Days of the week */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3 mb-3 sm:mb-4 lg:mb-6">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
            <div
              key={index}
              className="text-center text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-500 uppercase tracking-wider py-1 sm:py-2 lg:py-3"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="aspect-square" />
            }

            const past = isPastDate(date)
            const today = isToday(date)
            const weekend = isWeekend(date)
            
            // Show skeleton for ALL non-past dates when loading
            if (isLoading && !past) {
              return (
                <div
                  key={index}
                  className={`
                    aspect-square rounded-2xl animate-pulse flex flex-col items-center justify-center
                    ${weekend ? "bg-purple-100/50" : "bg-gray-100/50"}
                    ${today ? "ring-2 ring-purple-400 ring-offset-2 ring-offset-white/50" : ""}
                  `}
                >
                  <span className="text-sm sm:text-base lg:text-xl text-gray-400">{date.getDate()}</span>
                  <div className="w-6 h-2 sm:w-8 sm:h-2 lg:w-12 lg:h-3 bg-gray-300/50 rounded animate-pulse mt-1 sm:mt-2"></div>
                </div>
              )
            }
            
            const isBeingBooked = bookingInProgress && date.toDateString() === bookingInProgress.toDateString()
            const available = isDateAvailable(date) && !isBeingBooked
            const price = getDatePrice(date)

            return (
              <button
                key={index}
                onClick={() => available && !past && onDateSelect(date)}
                disabled={!available || past}
                className={`
                  aspect-square rounded-lg sm:rounded-xl lg:rounded-2xl flex flex-col items-center justify-center text-xs sm:text-sm lg:text-base font-medium p-1 sm:p-1.5 lg:p-2
                  transition-all duration-300 relative group
                  ${
                    available && !past
                      ? "hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 hover:shadow-lg hover:scale-105 cursor-pointer"
                      : "cursor-not-allowed"
                  }
                  ${
                    !available || past
                      ? "text-gray-300 bg-gray-50/50"
                      : weekend
                      ? "text-gray-800 bg-gradient-to-br from-purple-50/50 to-blue-50/50"
                      : "text-gray-700 bg-white/50 hover:bg-white"
                  }
                  ${today ? "ring-2 ring-purple-400 ring-offset-2 ring-offset-white/50" : ""}
                `}
              >
                <span className="text-sm sm:text-base lg:text-xl">{date.getDate()}</span>
                {available && !past && (
                  <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {price} kr
                  </span>
                )}
                {!available && !past && !isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="absolute inset-2 bg-gray-200/20 rounded-xl"></div>
                    <div className="h-px w-6 sm:w-8 lg:w-12 bg-gray-400 rotate-45"></div>
                  </div>
                )}
                {isBeingBooked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute inset-2 bg-purple-200/30 rounded-xl animate-pulse"></div>
                    <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-purple-700">Booking...</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Premium Legend */}
        <div className="mt-6 sm:mt-8 lg:mt-12 p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl">
          <div className="flex flex-wrap items-center justify-center sm:justify-around gap-3 sm:gap-4 text-[10px] sm:text-xs lg:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
              <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-white rounded-md sm:rounded-lg shadow-sm" />
              <span className="text-gray-600 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
              <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-md sm:rounded-lg" />
              <span className="text-gray-600 font-medium">Weekend</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
              <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gray-50 rounded-md sm:rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-px w-5 sm:w-6 lg:w-8 bg-gray-400 rotate-45"></div>
                </div>
              </div>
              <span className="text-gray-600 font-medium">Unavailable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}