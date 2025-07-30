"use client"

import { useState, useMemo } from 'react'
import { useStore } from '@/src/services/clientStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DollarSignIcon, 
  TrendingUpIcon, 
  CalendarIcon,
  UsersIcon,
  BarChart3Icon,
  LineChartIcon
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'
import { sv } from 'date-fns/locale'

export default function FinancialAnalyticsView() {
  const store = useStore()
  const [timeRange, setTimeRange] = useState('6months')
  
  const bookings = store.bookingModel.getAllBookings()
    .filter(b => b.status === 'confirmed')

  // Calculate date range based on selection
  const getDateRange = () => {
    const now = new Date()
    const monthsToSubtract = timeRange === '3months' ? 3 : 
                           timeRange === '6months' ? 6 : 
                           timeRange === '12months' ? 12 : 1
    
    return {
      start: startOfMonth(subMonths(now, monthsToSubtract - 1)),
      end: endOfMonth(now)
    }
  }

  const dateRange = getDateRange()
  const months = eachMonthOfInterval(dateRange)

  // Calculate monthly revenue
  const monthlyData = useMemo(() => {
    return months.map(month => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.date)
        return bookingDate >= monthStart && bookingDate <= monthEnd
      })

      const revenue = monthBookings.reduce((sum, booking) => sum + booking.price, 0)
      const bookingCount = monthBookings.length
      const guestCount = monthBookings.reduce((sum, booking) => sum + booking.guestCount, 0)

      return {
        month: format(month, 'MMM yyyy', { locale: sv }),
        revenue,
        bookingCount,
        guestCount,
        avgBookingValue: bookingCount > 0 ? revenue / bookingCount : 0
      }
    })
  }, [bookings, months])

  // Calculate totals
  const totals = useMemo(() => {
    const totalRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0)
    const totalBookings = monthlyData.reduce((sum, month) => sum + month.bookingCount, 0)
    const totalGuests = monthlyData.reduce((sum, month) => sum + month.guestCount, 0)
    
    return {
      revenue: totalRevenue,
      bookings: totalBookings,
      guests: totalGuests,
      avgBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
      avgGuestsPerBooking: totalBookings > 0 ? totalGuests / totalBookings : 0
    }
  }, [monthlyData])

  // Calculate growth metrics
  const growthMetrics = useMemo(() => {
    if (monthlyData.length < 2) return { revenue: 0, bookings: 0 }
    
    const currentMonth = monthlyData[monthlyData.length - 1]
    const previousMonth = monthlyData[monthlyData.length - 2]
    
    const revenueGrowth = previousMonth.revenue > 0 
      ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
      : 0
      
    const bookingGrowth = previousMonth.bookingCount > 0
      ? ((currentMonth.bookingCount - previousMonth.bookingCount) / previousMonth.bookingCount) * 100
      : 0

    return {
      revenue: revenueGrowth,
      bookings: bookingGrowth
    }
  }, [monthlyData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Finansiell analys</h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Senaste månaden</SelectItem>
            <SelectItem value="3months">Senaste 3 månaderna</SelectItem>
            <SelectItem value="6months">Senaste 6 månaderna</SelectItem>
            <SelectItem value="12months">Senaste 12 månaderna</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total intäkt</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.revenue)}</div>
            <p className={`text-xs ${growthMetrics.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(growthMetrics.revenue)} från förra månaden
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totalt antal bokningar</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.bookings}</div>
            <p className={`text-xs ${growthMetrics.bookings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(growthMetrics.bookings)} från förra månaden
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genomsnittligt bokningsvärde</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.avgBookingValue)}</div>
            <p className="text-xs text-muted-foreground">Per bokning</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totalt antal gäster</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.guests}</div>
            <p className="text-xs text-muted-foreground">
              Genomsnitt {Math.round(totals.avgGuestsPerBooking)} per evenemang
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Månatlig uppdelning</CardTitle>
          <CardDescription>Intäkts- och bokningstrender över tid</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((month, index) => (
              <div key={month.month} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{month.month}</span>
                  <span className="text-sm font-semibold">{formatCurrency(month.revenue)}</span>
                </div>
                <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                    style={{ 
                      width: `${totals.revenue > 0 ? (month.revenue / totals.revenue) * 100 : 0}%` 
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{month.bookingCount} bookings</span>
                  <span>{month.guestCount} guests</span>
                  <span>Avg. {formatCurrency(month.avgBookingValue)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Event Type Distribution</CardTitle>
          <CardDescription>Revenue by event type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['wedding', 'engagement', 'anniversary', 'other'].map(eventType => {
              const typeBookings = bookings.filter(b => b.eventType === eventType)
              const typeRevenue = typeBookings.reduce((sum, b) => sum + b.price, 0)
              const percentage = totals.revenue > 0 ? (typeRevenue / totals.revenue) * 100 : 0

              return (
                <div key={eventType} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{eventType}</span>
                    <span className="text-sm">{formatCurrency(typeRevenue)} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}