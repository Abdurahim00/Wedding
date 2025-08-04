"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Calendar, Users, Mail, Phone, Sparkles, Package, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { sv } from "date-fns/locale"
import type { AddOn } from "@/src/models/AddOnModel"

interface BookingModalViewProps {
  selectedDate: Date | null
  isSubmitting: boolean
  formData: {
    name: string
    email: string
    phone: string
    guestCount: string
    eventType: string
    specialRequests: string
  }
  datePrice?: number
  selectedAddOns?: { [key: string]: number }
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onInputChange: (field: string, value: string) => void
  onAddOnToggle?: (addOnId: string, quantity: number) => void
}

export default function BookingModalView({ 
  selectedDate, 
  isSubmitting,
  formData,
  datePrice,
  selectedAddOns = {},
  onClose, 
  onSubmit,
  onInputChange,
  onAddOnToggle
}: BookingModalViewProps) {
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [showAddOns, setShowAddOns] = useState(false)

  useEffect(() => {
    fetchAddOns()
  }, [])

  const fetchAddOns = async () => {
    try {
      const response = await fetch('/api/addons')
      if (response.ok) {
        const data = await response.json()
        setAddOns(data)
      }
    } catch (error) {
      console.error('Failed to fetch add-ons:', error)
    }
  }

  const calculateTotalPrice = () => {
    let total = datePrice || 0
    const guestCount = parseInt(formData.guestCount) || 1
    
    Object.entries(selectedAddOns).forEach(([addOnId, quantity]) => {
      const addOn = addOns.find(a => a.id === addOnId)
      if (addOn) {
        if (addOn.priceType === 'per_person') {
          // For per-person pricing, multiply by guest count and quantity
          total += addOn.price * guestCount * quantity
        } else {
          // For fixed pricing, just multiply by quantity
          total += addOn.price * quantity
        }
      }
    })
    return total
  }

  if (!selectedDate) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/50">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-2xl shadow-xl overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Reservera ditt datum</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="rounded-full hover:bg-gray-100 h-10 w-10 sm:h-9 sm:w-9"
            aria-label="Stäng"
          >
            <X className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Selected Date Display */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="flex items-center gap-2 text-gray-700 mb-3">
            <Calendar className="h-5 w-5" />
            <span className="font-medium text-base">{format(selectedDate, "EEEE d MMMM yyyy", { locale: sv })}</span>
          </div>
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-base text-gray-600">Grundpris:</span>
              <span className="font-medium text-base">{datePrice || 0} SEK</span>
            </div>
            {Object.keys(selectedAddOns).length > 0 && (
              <>
                {Object.entries(selectedAddOns).map(([addOnId, quantity]) => {
                  const addOn = addOns.find(a => a.id === addOnId)
                  if (!addOn || quantity === 0) return null
                  return (
                    <div key={addOnId} className="flex items-center justify-between text-base">
                      <span className="text-gray-600">{addOn.name} x{quantity}:</span>
                      <span>{addOn.price * quantity} SEK</span>
                    </div>
                  )
                })}
                <Separator className="my-3" />
              </>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-lg font-semibold">Totalt:</span>
              <span className="text-2xl font-bold text-gray-900">{calculateTotalPrice()} SEK</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-4 sm:p-6 space-y-6">
          <div>
            <Label htmlFor="name" className="text-base font-medium text-gray-700 mb-2 block">Fullständigt namn</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              placeholder="Ditt namn"
              required
              className="h-12 text-base"
            />
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <div>
              <Label htmlFor="email" className="text-base font-medium text-gray-700 mb-2 block">E-post</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                placeholder="epost@exempel.se"
                required
                className="h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-base font-medium text-gray-700 mb-2 block">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => onInputChange('phone', e.target.value)}
                placeholder="Telefonnummer"
                required
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <div>
              <Label htmlFor="guests" className="text-base font-medium text-gray-700 mb-2 block">Antal gäster</Label>
              <Input
                id="guests"
                type="number"
                min="1"
                max="500"
                value={formData.guestCount}
                onChange={(e) => onInputChange('guestCount', e.target.value)}
                placeholder="150"
                required
                className="h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="eventType" className="text-base font-medium text-gray-700 mb-2 block">Typ av evenemang</Label>
              <Select value={formData.eventType} onValueChange={(value) => onInputChange('eventType', value)}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Välj typ av evenemang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding">Bröllop</SelectItem>
                  <SelectItem value="reception">Mottagning</SelectItem>
                  <SelectItem value="anniversary">Jubileum</SelectItem>
                  <SelectItem value="corporate">Företagsevent</SelectItem>
                  <SelectItem value="other">Annat firande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="requests" className="text-base font-medium text-gray-700 mb-2 block">Speciella önskemål (valfritt)</Label>
            <Textarea
              id="requests"
              value={formData.specialRequests}
              onChange={(e) => onInputChange('specialRequests', e.target.value)}
              placeholder="Eventuella speciella önskemål..."
              rows={4}
              className="resize-none text-base min-h-[100px]"
            />
          </div>

          {/* Add-ons Section */}
          {addOns.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium text-gray-700 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Tilläggstjänster
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddOns(!showAddOns)}
                  className="text-sm px-3 py-2 h-10"
                >
                  {showAddOns ? 'Dölj' : 'Visa'} tillägg
                </Button>
              </div>
              
              {showAddOns && (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {addOns.map((addOn) => {
                    const quantity = selectedAddOns[addOn.id] || 0
                    const guestCount = parseInt(formData.guestCount) || 1
                    const itemTotal = addOn.priceType === 'per_person' 
                      ? addOn.price * guestCount * quantity
                      : addOn.price * quantity
                    
                    return (
                      <div key={addOn.id} className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`addon-${addOn.id}`}
                            checked={quantity > 0}
                            onCheckedChange={(checked) => {
                              if (onAddOnToggle) {
                                onAddOnToggle(addOn.id, checked ? 1 : 0)
                              }
                            }}
                            className="h-5 w-5"
                          />
                          <div className="flex-1">
                            <Label htmlFor={`addon-${addOn.id}`} className="font-medium cursor-pointer text-base">
                              {addOn.name}
                            </Label>
                            {addOn.description && (
                              <p className="text-sm text-gray-600 mt-1">{addOn.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <span className="text-base font-medium">
                              {addOn.price} SEK
                              {addOn.priceType === 'per_person' && (
                                <span className="text-sm text-gray-600"> {addOn.unit || 'per person'}</span>
                              )}
                            </span>
                            {quantity > 0 && addOn.priceType === 'per_person' && (
                              <div className="text-sm text-gray-600 mt-1">
                                Totalt: {itemTotal} SEK ({guestCount} gäster)
                              </div>
                            )}
                          </div>
                          {quantity > 0 && (
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => onAddOnToggle && onAddOnToggle(addOn.id, Math.max(0, quantity - 1))}
                              >
                                -
                              </Button>
                              <span className="w-12 text-center text-base font-medium">{quantity}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => onAddOnToggle && onAddOnToggle(addOn.id, quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div className="pt-6 flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 py-4 text-base font-medium"
            >
              Avbryt
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 text-base font-medium"
            >
              {isSubmitting ? 'Bearbetar...' : 'Fortsätt'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}