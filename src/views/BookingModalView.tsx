"use client"

import type React from "react"
import { X, Calendar, Users, Mail, Phone, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

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
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onInputChange: (field: string, value: string) => void
}

export default function BookingModalView({ 
  selectedDate, 
  isSubmitting,
  formData,
  onClose, 
  onSubmit,
  onInputChange
}: BookingModalViewProps) {

  if (!selectedDate) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-morphism rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="relative p-8 text-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="absolute right-4 top-4 rounded-full hover:bg-white/20"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-4">
            <Sparkles className="h-8 w-8 text-purple-600" />
          </div>
          
          <h2 className="text-3xl font-serif text-gray-900 mb-2">Book Your Special Day</h2>
          <p className="text-gray-600">Complete your details to reserve this date</p>
        </div>

        {/* Selected Date Display */}
        <div className="mx-8 mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl">
          <div className="flex items-center justify-center gap-3 text-gray-800">
            <Calendar className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-lg">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="px-8 pb-8 space-y-6">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              placeholder="John & Jane Doe"
              required
              className="mt-1 rounded-xl border-gray-200 focus:border-purple-400"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                <Mail className="inline h-4 w-4 mr-1" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                placeholder="hello@example.com"
                required
                className="mt-1 rounded-xl border-gray-200 focus:border-purple-400"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => onInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                required
                className="mt-1 rounded-xl border-gray-200 focus:border-purple-400"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="guests" className="text-sm font-medium text-gray-700">
                <Users className="inline h-4 w-4 mr-1" />
                Number of Guests
              </Label>
              <Input
                id="guests"
                type="number"
                min="1"
                max="500"
                value={formData.guestCount}
                onChange={(e) => onInputChange('guestCount', e.target.value)}
                placeholder="150"
                required
                className="mt-1 rounded-xl border-gray-200 focus:border-purple-400"
              />
            </div>

            <div>
              <Label htmlFor="eventType" className="text-sm font-medium text-gray-700">Event Type</Label>
              <Select value={formData.eventType} onValueChange={(value) => onInputChange('eventType', value)}>
                <SelectTrigger className="mt-1 rounded-xl border-gray-200 focus:border-purple-400">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="engagement">Engagement Party</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="other">Other Celebration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="requests" className="text-sm font-medium text-gray-700">Special Requests</Label>
            <Textarea
              id="requests"
              value={formData.specialRequests}
              onChange={(e) => onInputChange('specialRequests', e.target.value)}
              placeholder="Tell us about any special requirements or wishes..."
              rows={3}
              className="mt-1 rounded-xl border-gray-200 focus:border-purple-400 resize-none"
            />
          </div>

          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-premium rounded-xl py-6 text-base font-medium"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                'Continue to Payment'
              )}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="w-full rounded-xl py-4 hover:bg-gray-100"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}