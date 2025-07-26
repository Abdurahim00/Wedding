"use client"

import { useState } from "react"
import Header from "@/components/header"
import VideoSection from "@/components/video-section"
import BookingCalendar from "@/components/booking-calendar"
import BookingModal from "@/components/booking-modal"
import PaymentModal from "@/components/payment-modal"

export default function WeddingVenueDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setShowBookingModal(true)
  }

  const handleBookingSubmit = (data: any) => {
    setBookingData(data)
    setShowBookingModal(false)
    setShowPaymentModal(true)
  }

  const handlePaymentComplete = () => {
    setShowPaymentModal(false)
    setSelectedDate(null)
    setBookingData(null)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-16">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:h-[calc(100vh-4rem)]">
          <VideoSection />
          <div className="p-8 flex items-center justify-center">
            <BookingCalendar onDateSelect={handleDateSelect} />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <VideoSection />
          <div className="p-6">
            <BookingCalendar onDateSelect={handleDateSelect} />
          </div>
        </div>
      </main>

      {/* Modals */}
      {showBookingModal && (
        <BookingModal
          selectedDate={selectedDate}
          onClose={() => setShowBookingModal(false)}
          onSubmit={handleBookingSubmit}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          bookingData={bookingData}
          onClose={() => setShowPaymentModal(false)}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  )
}
