import type { Booking } from '@/src/types'

// Check if we're in server-side context
const isServer = typeof window === 'undefined'

// Only import Resend on server-side
let Resend: any
if (isServer) {
  Resend = require('resend').Resend
}

export class EmailService {
  private resend: any

  constructor() {
    if (isServer && process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY)
    }
  }

  async sendBookingConfirmation(booking: Booking, email: string): Promise<boolean> {
    try {
      const emailContent = this.generateBookingConfirmationEmail(booking)
      
      // In production with Resend configured
      if (this.resend) {
        const { data, error } = await this.resend.emails.send({
          from: process.env.EMAIL_FROM || 'Mazzika Fest <noreply@mazzikafest.com>',
          to: [email],
          subject: 'Booking Confirmation - Mazzika Fest Wedding Venue',
          html: emailContent,
        })

        if (error) {
          console.error('Resend error:', error)
          return false
        }

        console.log('Email sent successfully via Resend:', data)
        return true
      }
      
      // Development mode - log to console
      console.log('=== EMAIL CONFIRMATION ===')
      console.log(`To: ${email}`)
      console.log('From: hello@mazzikafest.com')
      console.log('Subject: Booking Confirmation - Mazzika Fest')
      console.log('Content Preview: Booking confirmed for', booking.name, 'on', new Date(booking.date).toLocaleDateString())
      console.log('========================')
      
      return true
    } catch (error) {
      console.error('Failed to send confirmation email:', error)
      return false
    }
  }

  private generateBookingConfirmationEmail(booking: Booking): string {
    const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const eventTypeDisplay = {
      wedding: 'Wedding',
      reception: 'Reception',
      anniversary: 'Anniversary Celebration',
      corporate: 'Corporate Event',
      other: 'Special Event'
    }[booking.eventType] || booking.eventType

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Booking Confirmed! 🎉</h1>
      <p>Your special day at Mazzika Fest is reserved</p>
    </div>
    
    <div class="content">
      <p>Dear ${booking.name},</p>
      
      <p>We're thrilled to confirm your booking at Mazzika Fest! Your ${eventTypeDisplay.toLowerCase()} is all set, and we can't wait to be part of your special celebration.</p>
      
      <div class="booking-details">
        <h3>Booking Details</h3>
        <div class="detail-row">
          <strong>Confirmation Number:</strong>
          <span>${booking.id}</span>
        </div>
        <div class="detail-row">
          <strong>Event Date:</strong>
          <span>${formattedDate}</span>
        </div>
        <div class="detail-row">
          <strong>Event Type:</strong>
          <span>${eventTypeDisplay}</span>
        </div>
        <div class="detail-row">
          <strong>Guest Count:</strong>
          <span>${booking.guestCount} guests</span>
        </div>
        <div class="detail-row">
          <strong>Total Amount:</strong>
          <span>${booking.price} SEK</span>
        </div>
        <div class="detail-row">
          <strong>Status:</strong>
          <span style="color: #28a745;">Confirmed & Paid ✓</span>
        </div>
        ${booking.specialRequests ? `
        <div class="detail-row">
          <strong>Special Requests:</strong>
          <span>${booking.specialRequests}</span>
        </div>
        ` : ''}
      </div>
      
      <h3>What's Next?</h3>
      <ol>
        <li><strong>Save the Date:</strong> We've reserved ${formattedDate} exclusively for you.</li>
        <li><strong>Planning Meeting:</strong> Our wedding coordinator will contact you within 48 hours to schedule your first planning session.</li>
        <li><strong>Venue Tour:</strong> If you haven't visited yet, we'd love to show you around our beautiful venue.</li>
      </ol>
      
      <h3>Contact Information</h3>
      <p>If you have any questions or need to make changes to your booking, please don't hesitate to reach out:</p>
      <ul>
        <li>Phone: +1 (555) 123-4567</li>
        <li>Email: hello@mazzikafest.com</li>
        <li>Office Hours: Mon-Fri 9AM-6PM, Sat-Sun 10AM-4PM</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>Thank you for choosing Mazzika Fest for your special day!</p>
      <p>123 Wedding Lane, Beverly Hills, CA 90210</p>
      <p>&copy; ${new Date().getFullYear()} Mazzika Fest. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `
  }
}

// Export a singleton instance
export const emailService = new EmailService()