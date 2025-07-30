"use client"

import { useState, useEffect } from 'react'
import { useStore } from '@/src/services/clientStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import type { Booking } from '@/src/types'

export default function BookingsManagementView() {
  const store = useStore()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch bookings from API on mount
  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        // Refresh bookings list
        fetchBookings()
      }
    } catch (error) {
      console.error('Failed to update booking status:', error)
    }
  }

  const getStatusBadge = (status: Booking['status']) => {
    const variants = {
      pending: { label: 'Väntande', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Bekräftad', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Avbokad', className: 'bg-red-100 text-red-800' }
    }
    const variant = variants[status]
    return <Badge className={variant.className}>{variant.label}</Badge>
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
    const matchesSearch = 
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm)
    return matchesStatus && matchesSearch
  })

  const sortedBookings = [...filteredBookings].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bokningshantering</CardTitle>
        <CardDescription>Visa och hantera alla bröllopsbokningar</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Sök efter namn, e-post eller telefon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrera efter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla bokningar</SelectItem>
              <SelectItem value="pending">Väntande</SelectItem>
              <SelectItem value="confirmed">Bekräftade</SelectItem>
              <SelectItem value="cancelled">Avbokade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Namn</TableHead>
                <TableHead>E-post</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Gäster</TableHead>
                <TableHead>Evenemangstyp</TableHead>
                <TableHead>Pris</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Loading bookings...
                  </TableCell>
                </TableRow>
              ) : sortedBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No bookings found
                  </TableCell>
                </TableRow>
              ) : (
                sortedBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{format(new Date(booking.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="font-medium">{booking.name}</TableCell>
                    <TableCell>{booking.email}</TableCell>
                    <TableCell>{booking.phone}</TableCell>
                    <TableCell>{booking.guestCount}</TableCell>
                    <TableCell className="capitalize">{booking.eventType}</TableCell>
                    <TableCell>${booking.price.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>
                      <Select
                        value={booking.status}
                        onValueChange={(value: Booking['status']) => 
                          handleStatusChange(booking.id!, value)
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Bookings</p>
              <p className="font-semibold">{filteredBookings.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Revenue</p>
              <p className="font-semibold">
                ${filteredBookings
                  .filter(b => b.status === 'confirmed')
                  .reduce((sum, b) => sum + b.price, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg. Guests</p>
              <p className="font-semibold">
                {filteredBookings.length > 0
                  ? Math.round(
                      filteredBookings.reduce((sum, b) => sum + b.guestCount, 0) / 
                      filteredBookings.length
                    )
                  : 0}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Conversion Rate</p>
              <p className="font-semibold">
                {filteredBookings.length > 0
                  ? Math.round(
                      (filteredBookings.filter(b => b.status === 'confirmed').length / 
                      filteredBookings.length) * 100
                    )
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}