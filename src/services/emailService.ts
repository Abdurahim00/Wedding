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
    if (isServer && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your-api-key-here') {
      console.log('Initializing Resend with API key...')
      try {
        this.resend = new Resend(process.env.RESEND_API_KEY)
        console.log('Resend initialized successfully')
      } catch (error) {
        console.error('Failed to initialize Resend:', error)
      }
    } else {
      console.log('Resend not initialized:', {
        isServer,
        hasApiKey: !!process.env.RESEND_API_KEY,
        apiKeyNotPlaceholder: process.env.RESEND_API_KEY !== 'your-api-key-here'
      })
    }
  }

  async sendBookingConfirmation(booking: Booking, email: string): Promise<boolean> {
    try {
      const emailContent = this.generateBookingConfirmationEmail(booking)
      
      // Check if Resend is configured
      console.log('Email Service Debug:')
      console.log('- Resend configured:', !!this.resend)
      console.log('- API Key exists:', !!process.env.RESEND_API_KEY)
      console.log('- API Key starts with:', process.env.RESEND_API_KEY?.substring(0, 10) + '...')
      console.log('- Email FROM:', process.env.EMAIL_FROM)
      console.log('- Email TO:', email)
      
      // In production with Resend configured
      if (this.resend) {
        try {
          const { data, error } = await this.resend.emails.send({
            from: process.env.EMAIL_FROM || 'Mazzika Fest <onboarding@resend.dev>',
            to: [email],
            subject: 'Bokningsbekräftelse - Mazzika Fest Bröllopslokal',
            html: emailContent,
          })

          if (error) {
            console.error('Resend API error details:', {
              error,
              message: error?.message,
              name: error?.name,
              statusCode: error?.statusCode
            })
            return false
          }

          console.log('Email sent successfully via Resend!')
          console.log('Response data:', {
            id: data?.id,
            from: data?.from,
            to: data?.to,
            createdAt: data?.createdAt
          })
          return true
        } catch (resendError) {
          console.error('Resend send error:', {
            error: resendError,
            message: resendError?.message,
            stack: resendError?.stack
          })
          throw resendError
        }
      }
      
      // Development mode - log to console
      console.log('=== EMAIL CONFIRMATION (Dev Mode - No Resend) ===')
      console.log(`To: ${email}`)
      console.log('From:', process.env.EMAIL_FROM)
      console.log('Subject: Bokningsbekräftelse - Mazzika Fest')
      console.log('Innehållsförhandsvisning: Bokning bekräftad för', booking.name, 'den', new Date(booking.date).toLocaleDateString('sv-SE'))
      console.log('========================')
      
      return true
    } catch (error) {
      console.error('Failed to send confirmation email:', {
        error,
        message: error?.message,
        stack: error?.stack
      })
      return false
    }
  }

  private generateBookingConfirmationEmail(booking: Booking): string {
    const formattedDate = new Date(booking.date).toLocaleDateString('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const eventTypeDisplay = {
      wedding: 'Bröllop',
      reception: 'Mottagning',
      anniversary: 'Jubileumsfirande',
      corporate: 'Företagsevenemang',
      other: 'Speciell händelse'
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
      <h1>Bokning bekräftad! 🎉</h1>
      <p>Din speciella dag hos Mazzika Fest är reserverad</p>
    </div>
    
    <div class="content">
      <p>Kära ${booking.name},</p>
      
      <p>Vi är glädda att bekräfta din bokning hos Mazzika Fest! Ditt ${eventTypeDisplay.toLowerCase()} är klart, och vi ser fram emot att vara en del av ditt speciella firande.</p>
      
      <div class="booking-details">
        <h3>Bokningsdetaljer</h3>
        <div class="detail-row">
          <strong>Bekräftelsenummer:</strong>
          <span>${booking.id}</span>
        </div>
        <div class="detail-row">
          <strong>Evenemangsdatum:</strong>
          <span>${formattedDate}</span>
        </div>
        <div class="detail-row">
          <strong>Typ av evenemang:</strong>
          <span>${eventTypeDisplay}</span>
        </div>
        <div class="detail-row">
          <strong>Antal gäster:</strong>
          <span>${booking.guestCount} gäster</span>
        </div>
        <div class="detail-row">
          <strong>Totalbelopp:</strong>
          <span>${booking.price.toLocaleString('sv-SE')} SEK</span>
        </div>
        <div class="detail-row">
          <strong>Status:</strong>
          <span style="color: #28a745;">Bekräftad & Betald ✓</span>
        </div>
        ${booking.specialRequests ? `
        <div class="detail-row">
          <strong>Särskilda önskemål:</strong>
          <span>${booking.specialRequests}</span>
        </div>
        ` : ''}
      </div>
      
      <h3>Vad händer nu?</h3>
      <ol>
        <li><strong>Spara datumet:</strong> Vi har reserverat ${formattedDate} exklusivt för dig.</li>
        <li><strong>Planeringsmöte:</strong> Vår bröllopskoordinator kommer att kontakta dig inom 48 timmar för att boka ditt första planeringsmöte.</li>
        <li><strong>Visning av lokalen:</strong> Om du inte har besökt oss ännu, visar vi gärna dig runt i vår vackra lokal.</li>
      </ol>
      
      <h3>Kontaktinformation</h3>
      <p>Om du har några frågor eller behöver göra ändringar i din bokning, tveka inte att kontakta oss:</p>
      <ul>
        <li>Telefon: 0735136002</li>
        <li>E-post: info@mazzikafest.se</li>
        <li>Kontorstider: Mån-Fre 09:00-18:00, Lör-Sön 10:00-16:00</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>Tack för att du valde Mazzika Fest för din speciella dag!</p>
      <p>Festvägen 123, Stockholm</p>
      <p>&copy; ${new Date().getFullYear()} Mazzika Fest. Alla rättigheter förbehållna.</p>
    </div>
  </div>
</body>
</html>
    `
  }
}

// Export a singleton instance
export const emailService = new EmailService()