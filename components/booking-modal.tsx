"use client"

import type React from "react"

import { useState } from "react"
import { X, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface BookingModalProps {
  selectedDate: Date | null
  onClose: () => void
  onSubmit: (data: any) => void
}

export default function BookingModal({ selectedDate, onClose, onSubmit }: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    guestCount: "",
    eventType: "wedding",
    specialRequests: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onSubmit({
      ...formData,
      date: selectedDate,
      price: 2500, // Base price in USD
    })

    setIsSubmitting(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!selectedDate) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-serif text-gray-900">Book Your Event</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Selected Date Display */}
        <div className="p-6 bg-rose-50 border-b border-gray-200">
          <div className="flex items-center gap-3 text-rose-700">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="guestCount" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Expected Guest Count *
            </Label>
            <Input
              id="guestCount"
              type="number"
              min="1"
              max="200"
              required
              value={formData.guestCount}
              onChange={(e) => handleInputChange("guestCount", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="eventType">Event Type</Label>
            <select
              id="eventType"
              value={formData.eventType}
              onChange={(e) => handleInputChange("eventType", e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="wedding">Wedding</option>
              <option value="reception">Reception</option>
              <option value="anniversary">Anniversary</option>
              <option value="corporate">Corporate Event</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => handleInputChange("specialRequests", e.target.value)}
              className="mt-1"
              rows={3}
              placeholder="Any special requirements or requests..."
            />
          </div>

          {/* Pricing Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Base Package</span>
              <span className="font-semibold">$2,500</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Includes venue rental, basic setup, and coordination</p>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full bg-rose-600 hover:bg-rose-700 text-white">
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              "Proceed to Payment"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
