"use client"

import { useState } from 'react'
import { useStore } from '@/src/services/clientStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import type { Booking } from '@/src/types'

export default function BookingsManagementView() {
  const store = useStore()
  const [bookings, setBookings] = useState(store.bookingModel.getAllBookings())
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const handleStatusChange = (bookingId: string, newStatus: Booking['status']) => {
    store.updateBooking(bookingId, { status: newStatus })
    setBookings(store.bookingModel.getAllBookings())
  }

  const getStatusBadge = (status: Booking['status']) => {
    const variants = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' }
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
        <CardTitle>Bookings Management</CardTitle>
        <CardDescription>View and manage all wedding bookings</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBookings.length === 0 ? (
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