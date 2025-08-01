export interface Booking {
  id?: string
  name: string
  email: string
  phone: string
  guestCount: number
  eventType: 'wedding' | 'reception' | 'anniversary' | 'corporate' | 'other'
  specialRequests?: string
  date: Date
  price: number
  status?: 'pending' | 'confirmed' | 'cancelled'
  createdAt?: Date
  updatedAt?: Date
}

export interface Payment {
  id?: string
  bookingId: string
  amount: number
  cardNumber: string
  expiryDate: string
  cvv: string
  billingAddress: string
  status: 'pending' | 'completed' | 'failed'
  createdAt?: Date
}

export interface CalendarDate {
  date: Date
  isAvailable: boolean
  isSelected?: boolean
}

export interface VenueInfo {
  name: string
  description: string
  capacity: number
  basePrice: number
  features: string[]
  images: string[]
  videoUrl?: string
}