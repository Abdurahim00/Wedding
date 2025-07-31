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
import { useSupabaseRealtime } from "@/src/hooks/useSupabaseRealtime"
import { CalendarProvider } from "@/src/contexts/CalendarContext"

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
  const [bookingInProgressDate, setBookingInProgressDate] = useState<Date | null>(null)

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
  
  // Get price data from calendar hook
  const { getDatePrice } = useSupabaseRealtime(days)

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
      price: getDatePrice(selectedDate),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setCurrentBooking(booking)
    setShowBookingModal(false)
    setShowPaymentModal(true)
    setBookingInProgressDate(selectedDate)
  }

  const handlePayment = async () => {
    if (!currentBooking) return

    console.log('Processing payment for booking:', currentBooking)
    setPaymentStatus("processing")

    try {
      // Create the booking in the database
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentBooking.name,
          email: currentBooking.email,
          phone: currentBooking.phone,
          guestCount: currentBooking.guestCount,
          eventType: currentBooking.eventType,
          specialRequests: currentBooking.specialRequests,
          date: currentBooking.date,
          price: currentBooking.price,
          status: 'confirmed'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create booking')
      }

      const createdBooking = await response.json()
      console.log('Booking created successfully:', createdBooking)
      
      setPaymentStatus("success")
      setShowSuccessMessage(true)
      
      setTimeout(() => {
        handlePaymentComplete()
      }, 2000)
    } catch (error) {
      console.error('Error creating booking:', error)
      setPaymentStatus("error")
      alert('Failed to create booking. Please try again.')
    }
  }

  const handlePaymentComplete = () => {
    setShowPaymentModal(false)
    setSelectedDate(null)
    setCurrentBooking(null)
    setBookingInProgressDate(null)
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
    <CalendarProvider>
      <div className="min-h-screen bg-white overflow-x-hidden">
        <HeaderView />

        <main className="pt-16 overflow-x-hidden">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top duration-300">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800 font-medium">
                Bokning bekräftad! Kolla din e-post för bekräftelseinformation.
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
                bookingInProgress={bookingInProgressDate}
              />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden overflow-x-hidden">
            <VideoSectionView />
            <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white overflow-x-hidden">
              <SimpleBookingCalendarView
                currentDate={currentDate}
                days={days}
                onDateSelect={handleDateSelect}
                onNavigateMonth={navigateMonth}
                bookingInProgress={bookingInProgressDate}
              />
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-serif text-gray-900 mb-4">Om Mazzika Fest</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Där tidlös elegans möter modern lyx, skapar den perfekta bakgrunden för din speciella dag
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
                    <h3 className="text-xl font-semibold mb-2">25+ år av excellens</h3>
                    <p className="text-gray-600">
                      I över två decennier har vi skapat oförglömliga bröllopsupplevelser, 
                      arrangerat över 5 000 fester och skapat minnen som varar livet ut.
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
                    <h3 className="text-xl font-semibold mb-2">Prisbelönt lokal</h3>
                    <p className="text-gray-600">
                      Erkänd som regionens främsta bröllopsplats, med flera utmärkelser 
                      för enastående service och arkitektonisk skönhet.
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
                    <h3 className="text-xl font-semibold mb-2">Engagerat team</h3>
                    <p className="text-gray-600">
                      Vårt erfarna team av bröllopsspecialister säkerställer att varje detalj är perfekt, 
                      från intima sammankomster till stora fester.
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
                    <h3 className="text-xl font-semibold mb-2">Bildsnöa miljöer</h3>
                    <p className="text-gray-600">
                      Från vårdade trädgårdar till eleganta festsalar, varje hörn av Mazzika Fest 
                      erbjuder fantastiska bakgrunder för dina bröllopsfotografier.
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
              <h2 className="text-4xl lg:text-5xl font-serif text-gray-900 mb-4">Kontakta oss</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Redo att börja planera ditt drömbröllop? Vi skulle älska att höra från dig
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <div className="glass-morphism rounded-3xl p-8">
                <h3 className="text-2xl font-semibold mb-6">Skicka ett meddelande</h3>
                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Förnamn</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Erik" 
                        className="mt-1 rounded-xl border-gray-200 focus:border-purple-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Efternamn</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Andersson" 
                        className="mt-1 rounded-xl border-gray-200 focus:border-purple-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">E-post</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="erik@exempel.se" 
                      className="mt-1 rounded-xl border-gray-200 focus:border-purple-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+46 70 123 45 67" 
                      className="mt-1 rounded-xl border-gray-200 focus:border-purple-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Meddelande</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Berätta om ditt drömbröllop..." 
                      rows={4}
                      className="mt-1 rounded-xl border-gray-200 focus:border-purple-400 resize-none"
                    />
                  </div>
                  
                  <Button className="w-full btn-premium rounded-xl py-6 text-base">
                    Skicka meddelande
                  </Button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div className="glass-morphism rounded-3xl p-8">
                  <h3 className="text-2xl font-semibold mb-6">Besök vår lokal</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="font-medium">Mazzika Fest</p>
                        <p className="text-gray-600">Festvägen 123, Stockholm</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Phone className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="font-medium">Telefon</p>
                        <p className="text-gray-600">0735136002</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Mail className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="font-medium">E-post</p>
                        <p className="text-gray-600">info@mazzikafest.se</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Clock className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="font-medium">Kontorstider</p>
                        <p className="text-gray-600">Måndag - Fredag: 09:00 - 18:00</p>
                        <p className="text-gray-600">Lördag - Söndag: 10:00 - 16:00</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-morphism rounded-3xl p-8">
                  <h3 className="text-xl font-semibold mb-4">Boka en visning</h3>
                  <p className="text-gray-600 mb-6">
                    Upplev skönheten av Mazzika Fest på plats. Boka en privat visning med våra 
                    bröllopsspecialister och utforska våra fantastiska lokaler, trädgårdar och faciliteter.
                  </p>
                  <Button variant="outline" className="w-full rounded-xl py-4">
                    Boka visning
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
          datePrice={selectedDate ? getDatePrice(selectedDate) : undefined}
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
    </CalendarProvider>
  )
}