"use client"

import { useState } from "react"
import HeaderView from "@/src/views/HeaderView"
import FooterView from "@/src/views/FooterView"
import VideoSectionView from "@/src/views/VideoSectionView"
import SimpleBookingCalendarView from "@/src/views/SimpleBookingCalendarView"
import BookingModalView from "@/src/views/BookingModalView"
import PaymentModalView from "@/src/views/PaymentModalView"
import type { Booking } from "@/src/types"
import { CheckCircle, Mail, Phone, MapPin, Clock, Users, Heart, Award, Camera } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// Simple static functions - no hooks
const getDaysInMonth = (date: Date): (Date | null)[] => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days: (Date | null)[] = []

  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day))
  }

  return days
}

export default function CleanDashboardView() {
  // Simple state - no complex hooks
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"selecting" | "processing" | "success" | "error">("selecting")
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null)

  const [bookingFormData, setBookingFormData] = useState({
    name: "",
    email: "",
    phone: "",
    guestCount: "",
    eventType: "wedding",
    specialRequests: "",
  })

  // Calculate days without memoization for now
  const days = getDaysInMonth(currentDate)

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(currentDate.getMonth() - 1)
    } else {
      newDate.setMonth(currentDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setShowBookingModal(true)
  }

  const handleBookingInputChange = (field: string, value: string) => {
    setBookingFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate) return

    // Create booking object
    const booking: Booking = {
      id: `booking_${Date.now()}`,
      name: bookingFormData.name,
      email: bookingFormData.email,
      phone: bookingFormData.phone,
      guestCount: parseInt(bookingFormData.guestCount),
      eventType: bookingFormData.eventType as Booking['eventType'],
      specialRequests: bookingFormData.specialRequests,
      date: selectedDate,
      price: 3, // Default price
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setCurrentBooking(booking)
    setShowBookingModal(false)
    setShowPaymentModal(true)
  }

  const handlePayment = () => {
    if (!currentBooking) return

    console.log('Processing payment for booking:', currentBooking)
    setPaymentStatus("processing")

    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus("success")
      setShowSuccessMessage(true)
      
      setTimeout(() => {
        handlePaymentComplete()
      }, 2000)
    }, 1000)
  }

  const handlePaymentComplete = () => {
    setShowPaymentModal(false)
    setSelectedDate(null)
    setCurrentBooking(null)
    setBookingFormData({
      name: "",
      email: "",
      phone: "",
      guestCount: "",
      eventType: "wedding",
      specialRequests: "",
    })
    setPaymentStatus("selecting")
    
    // Hide success message after 10 seconds
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 10000)
  }

  return (
    <div className="min-h-screen bg-white">
      <HeaderView />

      <main className="pt-16">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top duration-300">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800 font-medium">
                Booking confirmed! Check your email for confirmation details.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Hero Section */}
        <section className="relative">
          <div className="hidden lg:grid lg:grid-cols-5 lg:h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-white">
            <div className="col-span-3">
              <VideoSectionView />
            </div>
            <div className="col-span-2 p-8 flex items-center justify-center">
              <SimpleBookingCalendarView
                currentDate={currentDate}
                days={days}
                onDateSelect={handleDateSelect}
                onNavigateMonth={navigateMonth}
              />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            <VideoSectionView />
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
              <SimpleBookingCalendarView
                currentDate={currentDate}
                days={days}
                onDateSelect={handleDateSelect}
                onNavigateMonth={navigateMonth}
              />
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-serif text-gray-900 mb-4">About Bella Vista</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Where timeless elegance meets modern luxury, creating the perfect backdrop for your special day
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">25+ Years of Excellence</h3>
                    <p className="text-gray-600">
                      For over two decades, we've been crafting unforgettable wedding experiences, 
                      hosting over 5,000 celebrations and creating memories that last a lifetime.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Award-Winning Venue</h3>
                    <p className="text-gray-600">
                      Recognized as the region's premier wedding destination, with multiple awards 
                      for service excellence and architectural beauty.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Dedicated Team</h3>
                    <p className="text-gray-600">
                      Our experienced team of wedding specialists ensures every detail is perfect, 
                      from intimate gatherings to grand celebrations.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Picture-Perfect Settings</h3>
                    <p className="text-gray-600">
                      From manicured gardens to elegant ballrooms, every corner of Bella Vista 
                      provides stunning backdrops for your wedding photography.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 to-blue-200/20 blur-3xl"></div>
                <div className="relative grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-purple-100 to-blue-100 animate-float"></div>
                    <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100"></div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="aspect-square rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100"></div>
                    <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-pink-100 to-purple-100 animate-float" style={{ animationDelay: '3s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 px-4 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-serif text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Ready to start planning your dream wedding? We'd love to hear from you
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <div className="glass-morphism rounded-3xl p-8">
                <h3 className="text-2xl font-semibold mb-6">Send us a message</h3>
                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        placeholder="John" 
                        className="mt-1 rounded-xl border-gray-200 focus:border-purple-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Doe" 
                        className="mt-1 rounded-xl border-gray-200 focus:border-purple-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="john@example.com" 
                      className="mt-1 rounded-xl border-gray-200 focus:border-purple-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+1 (555) 123-4567" 
                      className="mt-1 rounded-xl border-gray-200 focus:border-purple-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us about your dream wedding..." 
                      rows={4}
                      className="mt-1 rounded-xl border-gray-200 focus:border-purple-400 resize-none"
                    />
                  </div>
                  
                  <Button className="w-full btn-premium rounded-xl py-6 text-base">
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div className="glass-morphism rounded-3xl p-8">
                  <h3 className="text-2xl font-semibold mb-6">Visit Our Venue</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="font-medium">Bella Vista Estate</p>
                        <p className="text-gray-600">123 Wedding Lane, Beverly Hills, CA 90210</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Phone className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-gray-600">+1 (555) 123-4567</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Mail className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-gray-600">hello@bellavista.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Clock className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="font-medium">Office Hours</p>
                        <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                        <p className="text-gray-600">Saturday - Sunday: 10:00 AM - 4:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-morphism rounded-3xl p-8">
                  <h3 className="text-xl font-semibold mb-4">Schedule a Tour</h3>
                  <p className="text-gray-600 mb-6">
                    Experience the beauty of Bella Vista firsthand. Book a private tour with our 
                    wedding specialists and explore our stunning venues, gardens, and facilities.
                  </p>
                  <Button variant="outline" className="w-full rounded-xl py-4">
                    Book a Tour
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterView />

      {/* Modals */}
      {showBookingModal && (
        <BookingModalView
          selectedDate={selectedDate}
          isSubmitting={false}
          formData={bookingFormData}
          onClose={() => setShowBookingModal(false)}
          onSubmit={handleBookingSubmit}
          onInputChange={handleBookingInputChange}
        />
      )}

      {showPaymentModal && (
        <PaymentModalView
          bookingData={currentBooking}
          paymentStatus={paymentStatus}
          selectedMethod="stripe"
          cardNumber=""
          expiryDate=""
          cvv=""
          billingAddress=""
          onClose={() => setShowPaymentModal(false)}
          onComplete={handlePaymentComplete}
          onPayment={handlePayment}
          onMethodSelect={() => {}}
          onCardNumberChange={() => {}}
          onExpiryDateChange={() => {}}
          onCvvChange={() => {}}
          onBillingAddressChange={() => {}}
          onRetry={() => setPaymentStatus("selecting")}
          formatCardNumber={(v: string) => v}
          formatExpiryDate={(v: string) => v}
        />
      )}
    </div>
  )
}