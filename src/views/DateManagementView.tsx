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
import { DollarSign, CalendarDays, CalendarX, Settings, Plus, Trash2 } from 'lucide-react'
import { format, addDays, isWeekend, startOfMonth, endOfMonth } from 'date-fns'
import { sv } from 'date-fns/locale'
import { DatePriceModel } from '@/src/models/DatePriceModel'

interface PricingRule {
  id: string
  name: string
  type: 'weekend' | 'weekday' | 'season' | 'holiday'
  price: number
  startDate?: string | null
  endDate?: string | null
  daysOfWeek: number[]
  priority: number
  isActive: boolean
}

export default function DateManagementView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [price, setPrice] = useState('5000')
  const [isAvailable, setIsAvailable] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [datePrices, setDatePrices] = useState<Array<any>>([])
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [loading, setLoading] = useState(true)
  
  // Bulk operations state
  const [bulkStartDate, setBulkStartDate] = useState<Date | undefined>()
  const [bulkEndDate, setBulkEndDate] = useState<Date | undefined>()
  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkAvailable, setBulkAvailable] = useState(true)
  
  // New rule state
  const [newRule, setNewRule] = useState({
    name: '',
    type: 'weekend' as const,
    price: '',
    daysOfWeek: [0, 6], // Sunday and Saturday
    priority: 0
  })
  
  useEffect(() => {
    fetchDatePrices()
    fetchPricingRules()
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
  
  const fetchPricingRules = async () => {
    try {
      const response = await fetch('/api/pricing-rules')
      const data = await response.json()
      setPricingRules(data)
    } catch (error) {
      console.error('Failed to fetch pricing rules:', error)
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
  
  const handleCreateRule = async () => {
    if (!newRule.name || !newRule.price) {
      alert('Fyll i alla obligatoriska fält')
      return
    }
    
    try {
      const response = await fetch('/api/pricing-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRule,
          price: parseFloat(newRule.price),
          isActive: true
        })
      })
      
      if (response.ok) {
        await fetchPricingRules()
        setNewRule({
          name: '',
          type: 'weekend',
          price: '',
          daysOfWeek: [0, 6],
          priority: 0
        })
      }
    } catch (error) {
      console.error('Failed to create rule:', error)
    }
  }
  
  const handleDeleteRule = async (id: string) => {
    try {
      const response = await fetch(`/api/pricing-rules?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchPricingRules()
      }
    } catch (error) {
      console.error('Failed to delete rule:', error)
    }
  }
  
  const getDateInfo = (date: Date | undefined) => {
    if (!date) return null
    
    const dateStr = date.toISOString().split('T')[0]
    const priceEntry = datePrices.find(p => p.date.split('T')[0] === dateStr)
    
    return priceEntry
  }
  
  useEffect(() => {
    if (selectedDate) {
      const info = getDateInfo(selectedDate)
      if (info) {
        setPrice(info.price.toString())
        setIsAvailable(info.isAvailable)
      } else {
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
        <TabsTrigger value="rules">Prisregler</TabsTrigger>
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
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-xl border"
                  modifiers={{
                    unavailable: datePrices
                      .filter(dp => !dp.isAvailable)
                      .map(dp => new Date(dp.date)),
                    priced: datePrices.map(dp => new Date(dp.date))
                  }}
                  modifiersStyles={{
                    unavailable: { color: '#ef4444', fontWeight: 'bold' },
                    priced: { backgroundColor: '#ddd6fe' }
                  }}
                />
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    Inställningar för {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: sv }) : 'valt datum'}
                  </Label>
                  
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
      
      <TabsContent value="rules">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skapa prisregel</CardTitle>
              <CardDescription>
                Sätt automatisk prissättning baserat på dagtyp eller säsong
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Regelnamn</Label>
                    <Input
                      value={newRule.name}
                      onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                      placeholder="t.ex. Helgpriser"
                    />
                  </div>
                  <div>
                    <Label>Regeltyp</Label>
                    <Select
                      value={newRule.type}
                      onValueChange={(value: any) => setNewRule({...newRule, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekend">Helg</SelectItem>
                        <SelectItem value="weekday">Vardag</SelectItem>
                        <SelectItem value="season">Säsong</SelectItem>
                        <SelectItem value="holiday">Helgdag</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Pris (SEK)</Label>
                    <Input
                      type="number"
                      min="3"
                      value={newRule.price}
                      onChange={(e) => setNewRule({...newRule, price: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Prioritet</Label>
                    <Input
                      type="number"
                      value={newRule.priority}
                      onChange={(e) => setNewRule({...newRule, priority: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <Button onClick={handleCreateRule} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Skapa regel
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Aktiva prisregler</CardTitle>
              <CardDescription>
                Rules are applied in priority order (highest first)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pricingRules.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No pricing rules created yet</p>
              ) : (
                <div className="space-y-2">
                  {pricingRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-gray-500">
                          {rule.type} • {rule.price} SEK • Priority: {rule.priority}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}