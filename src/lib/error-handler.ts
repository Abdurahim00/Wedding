export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleError(error: any): { message: string; code: string } {
  console.error('Error occurred:', error)

  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code
    }
  }

  if (error?.code === 'P2002') {
    return {
      message: 'This date is already booked',
      code: 'DUPLICATE_BOOKING'
    }
  }

  if (error?.code === 'P2025') {
    return {
      message: 'Booking not found',
      code: 'NOT_FOUND'
    }
  }

  if (error?.type === 'StripeCardError') {
    return {
      message: error.message || 'Payment failed',
      code: 'PAYMENT_FAILED'
    }
  }

  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR'
  }
}