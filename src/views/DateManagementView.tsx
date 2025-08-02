"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, CalendarDays, CalendarX, Settings, Package } from 'lucide-react'
import { format, addDays, isWeekend, startOfMonth, endOfMonth } from 'date-fns'
import { sv } from 'date-fns/locale'
import { DatePriceModel } from '@/src/models/DatePriceModel'
import { Skeleton } from '@/components/ui/skeleton'
import AddOnsManagementView from './AddOnsManagementView'


export default function DateManagementView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [price, setPrice] = useState('5000')
  const [isAvailable, setIsAvailable] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [datePrices, setDatePrices] = useState<Array<any>>([])
  const [loading, setLoading] = useState(true)
  const [calendarKey, setCalendarKey] = useState(0)
  
  // Bulk operations state
  const [bulkStartDate, setBulkStartDate] = useState<Date | undefined>()
  const [bulkEndDate, setBulkEndDate] = useState<Date | undefined>()
  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkAvailable, setBulkAvailable] = useState(true)
  
  useEffect(() => {
    fetchDatePrices()
  }, [])
  
  const fetchDatePrices = async () => {
    try {
      const response = await fetch('/api/date-prices')
      const data = await response.json()
      setDatePrices(data)
    } catch (error) {
      console.error('Failed to fetch date prices:', error)
    } finally {
      setLoading(false)
    }
  }
  
  
  const handleSingleDateUpdate = async () => {
    if (!selectedDate || !price) return
    
    const priceValue = parseFloat(price)
    if (isNaN(priceValue) || priceValue < 3) {
      alert('Ange ett giltigt pris (minst 3 SEK)')
      return
    }
    
    try {
      const response = await fetch('/api/date-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          price: priceValue,
          isAvailable
        })
      })
      
      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
        await fetchDatePrices()
        // Force calendar to re-render
        setCalendarKey(prev => prev + 1)
      } else {
        const error = await response.json()
        console.error('Failed to update date:', error)
        alert(`Misslyckades att uppdatera datum: ${error.error || 'Okänt fel'}`)
      }
    } catch (error) {
      console.error('Failed to update date:', error)
      alert('Misslyckades att uppdatera datum. Försök igen.')
    }
  }
  
  const handleBulkUpdate = async () => {
    if (!bulkStartDate || !bulkEndDate || !bulkPrice) {
      alert('Välj datumintervall och pris')
      return
    }
    
    const priceValue = parseFloat(bulkPrice)
    if (isNaN(priceValue) || priceValue < 3) {
      alert('Ange ett giltigt pris (minst 3 SEK)')
      return
    }
    
    // Update each date in the range
    const currentDate = new Date(bulkStartDate)
    const endDate = new Date(bulkEndDate)
    
    while (currentDate <= endDate) {
      await fetch('/api/date-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: currentDate.toISOString(),
          price: priceValue,
          isAvailable: bulkAvailable
        })
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
    await fetchDatePrices()
    
    // Reset form
    setBulkStartDate(undefined)
    setBulkEndDate(undefined)
    setBulkPrice('')
  }
  
  
  const getDateInfo = (date: Date | undefined) => {
    if (!date) return null
    
    // Compare dates by year, month, and day only (ignore time/timezone)
    const targetYear = date.getFullYear()
    const targetMonth = date.getMonth()
    const targetDate = date.getDate()
    
    const priceEntry = datePrices.find(p => {
      const pDate = new Date(p.date)
      return pDate.getFullYear() === targetYear && 
             pDate.getMonth() === targetMonth && 
             pDate.getDate() === targetDate
    })
    
    return priceEntry
  }
  
  useEffect(() => {
    if (selectedDate) {
      const info = getDateInfo(selectedDate)
      if (info) {
        console.log(`Date ${selectedDate.toLocaleDateString()}: Available=${info.isAvailable}, Price=${info.price}`)
        setPrice(info.price.toString())
        setIsAvailable(info.isAvailable !== undefined ? info.isAvailable : true)
      } else {
        console.log(`Date ${selectedDate.toLocaleDateString()}: No data, using defaults`)
        setPrice('5000')
        setIsAvailable(true)
      }
    }
  }, [selectedDate, datePrices])

  return (
    <Tabs defaultValue="single" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="single">Enskilt datum</TabsTrigger>
        <TabsTrigger value="bulk">Bulkoperationer</TabsTrigger>
        <TabsTrigger value="addons">
          <Package className="h-4 w-4 mr-2" />
          Add-ons
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="single">
        <Card>
          <CardHeader>
            <CardTitle>Hantera enskilda datum</CardTitle>
            <CardDescription>
              Sätt priser och tillgänglighet för specifika datum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <Label className="text-base font-semibold mb-4 block">Välj datum</Label>
                {loading ? (
                  <div className="rounded-xl border p-4 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <Skeleton className="h-6 w-32" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 35 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <Calendar
                    key={calendarKey}
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-xl border"
                    modifiers={{
                      unavailable: datePrices
                        .filter(dp => dp.isAvailable === false)
                        .map(dp => new Date(dp.date)),
                      available: datePrices
                        .filter(dp => dp.isAvailable === true)
                        .map(dp => new Date(dp.date)),
                      priced: datePrices.map(dp => new Date(dp.date))
                    }}
                    modifiersStyles={{
                      unavailable: { 
                        backgroundColor: '#fee2e2 !important', 
                        color: '#dc2626', 
                        fontWeight: 'bold' 
                      },
                      available: {
                        backgroundColor: '#ddd6fe !important'
                      },
                      priced: {}
                    }}
                  />
                )}
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    Inställningar för {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: sv }) : 'valt datum'}
                  </Label>
                  
                  {loading ? (
                    <div className="space-y-4">
                      <div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-11" />
                      </div>
                      <Skeleton className="h-10 w-full mt-4" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="price">Pris (SEK)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              id="price"
                              type="number"
                              min="3"
                              step="100"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="available">Tillgänglig för bokning</Label>
                          <Switch
                            id="available"
                            checked={isAvailable}
                            onCheckedChange={setIsAvailable}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleSingleDateUpdate}
                        className="w-full mt-4"
                        disabled={!selectedDate}
                      >
                        Uppdatera datum
                      </Button>
                      
                      {showSuccess && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800 text-sm font-medium">
                            ✓ Datum uppdaterat!
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="bulk">
        <Card>
          <CardHeader>
            <CardTitle>Bulkhantering av datum</CardTitle>
            <CardDescription>
              Uppdatera flera datum samtidigt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Startdatum</Label>
                  <Calendar
                    mode="single"
                    selected={bulkStartDate}
                    onSelect={setBulkStartDate}
                    className="rounded-xl border"
                  />
                </div>
                <div>
                  <Label>Slutdatum</Label>
                  <Calendar
                    mode="single"
                    selected={bulkEndDate}
                    onSelect={setBulkEndDate}
                    className="rounded-xl border"
                    disabled={(date) => bulkStartDate ? date < bulkStartDate : false}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bulkPrice">Pris för alla datum (SEK)</Label>
                  <Input
                    id="bulkPrice"
                    type="number"
                    min="3"
                    step="100"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="bulkAvailable">Tillgänglig för bokning</Label>
                  <Switch
                    id="bulkAvailable"
                    checked={bulkAvailable}
                    onCheckedChange={setBulkAvailable}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleBulkUpdate}
                className="w-full"
                disabled={!bulkStartDate || !bulkEndDate || !bulkPrice}
              >
                Uppdatera {bulkStartDate && bulkEndDate ? 
                  Math.ceil((bulkEndDate.getTime() - bulkStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0} datum
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="addons">
        <AddOnsManagementView />
      </TabsContent>
    </Tabs>
  )
}