"use client"

import { useState } from 'react'
import { useStore } from '@/src/services/clientStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { DollarSign, CalendarDays, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

export default function DatePricingView() {
  const store = useStore()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [price, setPrice] = useState('3')
  const [showSuccess, setShowSuccess] = useState(false)
  const [datePrices, setDatePrices] = useState<Map<string, number>>(new Map())
  
  const handlePriceUpdate = () => {
    if (!selectedDate || !price) return
    
    const priceValue = parseFloat(price)
    if (isNaN(priceValue) || priceValue < 3) {
      alert('Please enter a valid price (minimum 3 SEK due to Stripe requirements)')
      return
    }
    
    // Update local state
    const newPrices = new Map(datePrices)
    newPrices.set(selectedDate.toDateString(), priceValue)
    setDatePrices(newPrices)
    
    // Update in store (async)
    store.setDatePrice(selectedDate.toDateString(), priceValue)
      .then(() => {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      })
      .catch(error => {
        console.error('Failed to update price:', error)
        alert('Failed to update price. Please try again.')
      })
  }
  
  const getDatePrice = (date: Date | undefined) => {
    if (!date) return 3
    return datePrices.get(date.toDateString()) || 3
  }
  
  // Get all dates with custom prices
  const customPriceDates = Array.from(datePrices.entries()).map(([dateStr, price]) => ({
    date: new Date(dateStr),
    dateStr,
    price
  })).sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
    <div className="space-y-6">
      {/* Price Setting */}
      <Card>
        <CardHeader>
          <CardTitle>Set Date Pricing</CardTitle>
          <CardDescription>
            Configure custom pricing for specific dates. Default price is 3 SEK (Stripe minimum).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <div>
              <Label className="text-base font-semibold mb-4 block">Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-xl border"
                disabled={(date) => date < new Date()}
              />
            </div>
            
            {/* Price Input */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="price" className="text-base font-semibold mb-2 block">
                  Price for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Selected Date'}
                </Label>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="price"
                      type="number"
                      min="3"
                      step="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Enter price"
                      className="pl-10"
                    />
                  </div>
                  <span className="flex items-center text-gray-600 font-medium">SEK</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Current price for this date: {getDatePrice(selectedDate)} SEK
                </p>
              </div>
              
              <Button 
                onClick={handlePriceUpdate}
                className="w-full"
                disabled={!selectedDate || !price}
              >
                Update Price
              </Button>
              
              {showSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm font-medium">
                    ✓ Price updated successfully!
                  </p>
                </div>
              )}
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Pricing Strategy Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Weekends typically command higher prices</li>
                  <li>• Popular seasons (May-September) can be priced premium</li>
                  <li>• Consider holidays and special dates</li>
                  <li>• Last-minute bookings can have dynamic pricing</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Custom Prices List */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Price Dates</CardTitle>
          <CardDescription>
            All dates with custom pricing configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customPriceDates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No custom prices set yet</p>
              <p className="text-sm">All dates are using the default price of 3 SEK</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customPriceDates.map(({ dateStr, price }) => (
                <div key={dateStr} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {format(new Date(dateStr), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{price} SEK</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        store.setDatePrice(dateStr, 3)
                          .then(() => {
                            // Update local state
                            const newPrices = new Map(datePrices)
                            newPrices.set(dateStr, 3)
                            setDatePrices(newPrices)
                            setShowSuccess(true)
                            setTimeout(() => setShowSuccess(false), 3000)
                          })
                          .catch(error => {
                            console.error('Failed to reset price:', error)
                            alert('Failed to reset price. Please try again.')
                          })
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}