"use client"

import type React from "react"
import { X, Calendar, Users, Mail, Phone, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { sv } from "date-fns/locale"

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
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onInputChange: (field: string, value: string) => void
}

export default function BookingModalView({ 
  selectedDate, 
  isSubmitting,
  formData,
  datePrice,
  onClose, 
  onSubmit,
  onInputChange
}: BookingModalViewProps) {

  if (!selectedDate) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Reservera ditt datum</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="rounded-full hover:bg-gray-100"
            aria-label="Stäng"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Selected Date Display */}
        <div className="px-6 pt-6">
          <div className="flex items-center gap-2 text-gray-700 mb-1">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{format(selectedDate, "EEEE d MMMM yyyy", { locale: sv })}</span>
          </div>
          {datePrice && (
            <div className="text-2xl font-bold text-gray-900">{datePrice} SEK</div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Fullständigt namn</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              placeholder="Ditt namn"
              required
              className="mt-1"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">E-post</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                placeholder="epost@exempel.se"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => onInputChange('phone', e.target.value)}
                placeholder="Telefonnummer"
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="guests" className="text-sm font-medium text-gray-700">Antal gäster</Label>
              <Input
                id="guests"
                type="number"
                min="1"
                max="500"
                value={formData.guestCount}
                onChange={(e) => onInputChange('guestCount', e.target.value)}
                placeholder="150"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="eventType" className="text-sm font-medium text-gray-700">Typ av evenemang</Label>
              <Select value={formData.eventType} onValueChange={(value) => onInputChange('eventType', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Välj typ av evenemang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding">Bröllop</SelectItem>
                  <SelectItem value="engagement">Förlovningsfest</SelectItem>
                  <SelectItem value="anniversary">Jubileum</SelectItem>
                  <SelectItem value="other">Annat firande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="requests" className="text-sm font-medium text-gray-700">Speciella önskemål (valfritt)</Label>
            <Textarea
              id="requests"
              value={formData.specialRequests}
              onChange={(e) => onInputChange('specialRequests', e.target.value)}
              placeholder="Eventuella speciella önskemål..."
              rows={3}
              className="mt-1 resize-none"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Avbryt
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {isSubmitting ? 'Bearbetar...' : 'Fortsätt'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}